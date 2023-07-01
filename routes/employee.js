const express=require('express');
const paypal = require('paypal-rest-sdk');
const router=express.Router();
const {isLoggedIn,isAuthor} = require('../middleware');
//const catchAsync=require('../utils/catchAsync');
//const {campgroundSchema}=require('../schemas.js')
//const ExpressError=require('../utils/ExpressError')
const Employee=require('../models/employee');
const passport=require('passport')
const Razorpay = require('razorpay');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AR5CRs9Oo3Ako7MO818Tgc_GUvBrDqhpmtUJRw8kmBqV8BMJXOMdarCTbJk-Om_CavgK3aTVMK7dsG8m',
  'client_secret': 'EOkAyUbtOhao9FdybaLz3s_bK1W8MF27JQnDdj8Qjz5QjzA0bDITHKjCyWvuulqYpFHQdOL4qhinRajK'
});
var instance = new Razorpay({
  key_id: 'rzp_test_z5CdHKLS42pn1W',
  key_secret: '4ZDZdt5hMFGADxI5HhljInw4',
});

const validateEmployee=(req,res,next)=>{ 

    const {error}=employeeSchema.validate(req.body)
    
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
    }


    // const isLoggedIn = (req, res, next) => {
    //   if (!req.isAuthenticated()) {
    //       req.session.returnTo = req.originalUrl
    //       req.flash('error', 'You must be signed in first!');
    //       return res.redirect('/login');
    //   }
    //   next();
    // }

    router.get('/new',isLoggedIn,async(req,res)=>{
        res.render('employees/employee')
    })
     router.get('/',isLoggedIn,async(req,res)=>{
       const employees=await Employee.find({})
       user=req.user
          res.render('employees/index',{employees,user})
      })
       router.get('/search',isLoggedIn,async(req,res)=>{
         //console.log(req.query.search)
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
       
       })
       router.get('/search/:id',isLoggedIn,async(req,res)=>{
        //console.log(req.query.search)
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
      
      })
    
     router.post('/',isLoggedIn,async(req,res)=>{
      // console.log(req.body)
      
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
      })
     router.get('/:id',isLoggedIn,isAuthor,async(req,res)=>{
      const employee = await Employee.findById(req.params.id).populate('author')
      
      if(!employee){
          //req.flash('error','Cannot find that employee');
          return res.redirect('/')
      }
      //console.log(req)
      res.render('employees/show',{employee});
    })
    


    

    router.get('/:id/edit',isLoggedIn,isAuthor,async(req,res)=>{
      const employee = await Employee.findById(req.params.id)
      if(!employee){
         // req.flash('error','Cannot find that campground');
          return res.redirect('/')
      }
      res.render('employees/edit',{employee});
    })
    router.put('/:id',isLoggedIn,isAuthor,async(req,res)=>{
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
      
      const{id}=req.params;
      actual_salary=req.body.salary-req.body.sdm*req.body.absent;
     const employee=await Employee.findByIdAndUpdate(id,{empcode,sdm,absent,year,month,name,present,salary,actual_salary});

     //req.flash('success','Successfully updated campground!')
     res.redirect(`/employees/${employee._id}`)
    })
    router.delete('/:id',isLoggedIn,isAuthor,async(req,res)=>{
      const{id}=req.params;
      await Employee.findByIdAndDelete(id);
      //req.flash('success','successfully deleted campground')
      res.redirect('/employees');
    })
    router.post('/create/orderId',(req,res)=>{
      console.log("create orderId request",req.body);
      var options = {  amount: req.body.actual_salary*100,  // amount in the smallest currency unit 
      currency: "INR",
       receipt: "rcp1"};
       instance.orders.create(options, function(err, order) {  
        console.log(order);
       res.send({orderId:order.id});
     });
     console.log(req.body.actual_salary);
    })
 
      

// router.get('/',catchAsync(async(req,res)=>{
//     const campgrounds=await Campground.find({});
//     res.render('campgrounds/index',{campgrounds})
// }))
// router.get('/new',catchAsync((req,res)=>{
//     res.render('campgrounds/new');
// }))
// router.post('/',validateCampground, catchAsync( async (req,res,next)=>{
//   //if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
  
//   const campground=new Campground(req.body.campground);
//     await campground.save();
//     req.flash('success','Successfully made a new campground')
//     res.redirect(`/campgrounds/${campground._id}`)
   
// }))
// router.get('/:id',catchAsync(async(req,res)=>{
//     const campground = await Campground.findById(req.params.id).populate('reviews');
//     if(!campground){
//         req.flash('error','Cannot find that campground');
//         return res.redirect('/campgrounds')
//     }
//     res.render('campgrounds/show',{campground});
// }))
// router.get('/:id/edit',catchAsync(async(req,res)=>{
//     const campground = await Campground.findById(req.params.id)
//     if(!campground){
//         req.flash('error','Cannot find that campground');
//         return res.redirect('/campgrounds')
//     }
//     res.render('campgrounds/edit',{campground});
// }))
// router.put('/:id',validateCampground,catchAsync(async(req,res)=>{
//     const{id}=req.params;
//    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
//    req.flash('success','Successfully updated campground!')
//    res.redirect(`/campgrounds/${campground._id}`)
// }))
// router.delete('/:id',catchAsync(async(req,res)=>{
//     const{id}=req.params;
//     await Campground.findByIdAndDelete(id);
//     req.flash('success','successfully deleted campground')
//     res.redirect('/campgrounds');
// }))
module.exports=router;