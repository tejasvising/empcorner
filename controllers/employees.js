const Employee = require('../models/employee');
const passport=require('passport')



module.exports.index = async (req, res) => {
    const employees=await Employee.find({})
    user=req.user
       res.render('employees/index',{employees,user})
    
}

module.exports.renderNewForm = (req, res) => {
    res.render('employees/employee')
}
module.exports.search=async (req, res, next) =>{
    user=req.user
         const employees=await Employee.find({})
         for(let employee of employees){
         if(req.query.search==employee.name){
           if(employee.author.equals(req.user._id)){
          return res.redirect(`/employees/${employee._id}`)
          };
         }
        }
         req.flash('error', 'You do not have permission to do that!');
         return res.redirect('/employees');
}
module.exports.searchId=async (req, res, next) =>{
    console.log(req.params)
    user=req.user
     const employees=await Employee.find({})
     for(let employee of employees){
     if(req.params.id==employee.name){
      if(employee.author.equals(req.user._id)){
    return res.redirect(`/employees/${employee._id}`)
      };
     }
     }
     req.flash('error', 'You do not have permission to do that!');
     return res.redirect('/employees');
}
module.exports.createOrderId=async (req, res, next) =>{
    console.log("create orderId request",req.body);
    var options = {  amount: req.body.actual_salary*100,  // amount in the smallest currency unit 
    currency: "INR",
     receipt: "rcp1"};
     instance.orders.create(options, function(err, order) {  
      console.log(order);
     res.send({orderId:order.id});
   });
   console.log(req.body.actual_salary);
}
module.exports.createEmployee = async (req, res, next) => {
    var {empcode,sdm,absent,year,month,name,present,salary}=req.body
    
       
        
         if(month==2 && year%4==0){
           absent=29-present
         }
         if(month==2 && year%4!=0){
           absent=28-present
         }
         if(month==4 || month==6 || month==9 || month==11){
           absent=30-present
         }
         if(month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12){
           absent=31-present
         }
         actual_salary=salary-sdm*absent
         const employee=new Employee({empcode,sdm,absent,year,month,name,present,salary,actual_salary})
        employee.author=req.user._id;
      //  console.log(req.currentUser)
         await employee.save();
         console.log(employee)
       // req.session.user_id=user._id;
       //  res.send({empcode,sdm,absent,year,month,name,present,salary,actual_salary})
       res.redirect(`/employees/${employee._id}`)
}

module.exports.showEmployee = async (req, res,) => {
    const employee = await Employee.findById(req.params.id).populate('author')
      
    if(!employee){
        //req.flash('error','Cannot find that employee');
        return res.redirect('/')
    }
    //console.log(req)
    res.render('employees/show',{employee});
}

module.exports.renderEditForm = async (req, res) => {
    const employee = await Employee.findById(req.params.id)
      if(!employee){
          req.flash('error','Cannot find that employee');
          return res.redirect('/')
      }
      res.render('employees/edit',{employee});
}

module.exports.updateEmployee = async (req, res) => {
    var emp = await Employee.findById(req.params.id)
    const{id}=req.params;
    var {empcode,sdm,absent,year,month,name,present,salary}=req.body
  
    if(month==2 && year%4==0){
      absent=29-present
    }
    if(month==2 && year%4!=0){
      absent=28-present
   }
   if(month==4 || month==6 || month==9 || month==11){
      absent=30-present
    }
    if(month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12){
      absent=31-present
    }
    
   
    console.log(req.body);
   
  //  console.log(req.body.employee)
 
//   actual_salary=req.body.salary-req.body.sdm*req.body.absent;
    actual_salary=salary-sdm*absent
   const employee=await Employee.findByIdAndUpdate(id,{empcode,sdm,absent,year,month,name,present,salary,actual_salary});
   await employee.save();
   //req.flash('success','Successfully updated campground!')
   res.redirect(`/employees/${employee._id}`)
}

module.exports.deleteEmployee = async (req, res) => {
    const{id}=req.params;
    await Employee.findByIdAndDelete(id);
    //req.flash('success','successfully deleted campground')
    res.redirect('/employees');
}