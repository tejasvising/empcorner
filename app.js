//mongo mongoose
//use empcorner
// db.employees.find() 

const express=require('express')
//var bodyParser = require('body-parser')


const mongoose=require('mongoose')
const Employee=require('./models/employee');
const Owner=require('./models/owner')
const ExpressError=require('./utils/ExpressError')
const session=require('express-session')
const flash = require('connect-flash');
var methodOverride = require('method-override')

const passport=require('passport')
const LocalStrategy=require('passport-local')


const ownerRoutes=require('./routes/owner')
const employeeRoutes=require('./routes/employee');

const catchAsync=require('./utils/catchAsync');
const path=require('path');
mongoose.connect('mongodb://localhost:27017/empcorner')
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once('open',()=>{
    console.log('Database Connected');
})

const app=express();

app.set('view engine','ejs');
app.set('views','views')
app.use(express.json())

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.urlencoded({extended : true}));
// app.use(bodyParser.json());


const sessionConfig={
  secret:'thisshouldbeabettersecret!',
  resave:false,
  saveUninitialized:true,
  cookie:{
      httpOnly:true,
      express:Date.now()+1000*60*60*24*7,
      maxAge:1000*60*60*24*7
  }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(Owner.authenticate()))

passport.serializeUser(Owner.serializeUser())
passport.deserializeUser(Owner.deserializeUser())

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl
      req.flash('error', 'You must be signed in first!');
      return res.redirect('/login');
  }
  next();
}
const validateEmployee=(req,res)=>{ 

  const {error}=employeeSchema.validate(req.body)
  
  if(error){
      const msg=error.details.map(el=>el.message).join(',')
      throw new ExpressError(msg,400)
  }else{
      next();
  }
  }
 
 
     // app.post('/create/orderId',(req,res)=>{
     //   console.log("create orderId request",req.body);
       //   var options = {  amount: req.body.salary-req.body.sdm*req.body.absent,  // amount in the smallest currency unit 
  //   currency: "INR",
  //    receipt: "rcp1"};
  //    instance.orders.create(options, function(err, order) {  
  //     console.log(order);
  //    res.send({orderId:order.id});
  //  });
  // })
// app.get('/new',(req,res)=>{
//     res.render('employees/employee')
// })
//  app.get('/',async(req,res)=>{
//    const employees=await Employee.find({})
//       res.render('employees/index',{employees})
//   })

//  app.post('/',async(req,res)=>{
//    console.log(req.body)
//   var {empcode,sdm,absent,year,month,name,present,salary}=req.body

    
    
//      if(month==2 && year%4==0){
//        absent=29-present
//      }
//      if(month==2 && year%4!=0){
//        absent=28-present
//      }
//      if(month==4 || month==6 || month==9 || month==11){
//        absent=30-present
//      }
//      if(month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12){
//        absent=31-present
//      }
//      actual_salary=salary-sdm*absent
//      const employee=new Employee({empcode,sdm,absent,year,month,name,present,salary,actual_salary})
//      await employee.save();
//    // req.session.user_id=user._id;
//    //  res.send({empcode,sdm,absent,year,month,name,present,salary,actual_salary})
//    res.redirect(`/${employee._id}`)
//   })
//  app.get('/:id',async(req,res)=>{
//   const employee = await Employee.findById(req.params.id);
  
//   if(!employee){
//       //req.flash('error','Cannot find that employee');
//       return res.redirect('/')
//   }
//   res.render('employees/show',{employee});
// })

// app.get('/:id/edit',async(req,res)=>{
//   const employee = await Employee.findById(req.params.id)
//   if(!employee){
//      // req.flash('error','Cannot find that campground');
//       return res.redirect('/')
//   }
//   res.render('employees/edit',{employee});
// })
// app.put('/:id',async(req,res)=>{
//   var {empcode,sdm,absent,year,month,name,present,salary}=req.body
//   if(month==2 && year%4==0){
//     absent=29-present
//   }
//   if(month==2 && year%4!=0){
//     absent=28-present
//   }
//   if(month==4 || month==6 || month==9 || month==11){
//     absent=30-present
//   }
//   if(month==1 || month==3 || month==5 || month==7 || month==8 || month==10 || month==12){
//     absent=31-present
//   }
  
//   const{id}=req.params;
//   actual_salary=req.body.salary-req.body.sdm*req.body.absent;
//  const employee=await Employee.findByIdAndUpdate(id,{empcode,sdm,absent,year,month,name,present,salary,actual_salary});
//  //req.flash('success','Successfully updated campground!')
//  res.redirect(`/${employee._id}`)
// })
// app.delete('/:id',async(req,res)=>{
//   const{id}=req.params;
//   await Employee.findByIdAndDelete(id);
//   //req.flash('success','successfully deleted campground')
//   res.redirect('/');
// })

// app.get('/owners/register',(req,res)=>{
//   res.render('owners/register')
// })

// app.post('/owners/register',async(req,res)=>{
//   try{
//       const {email,username,password}=req.body;
//   const owner=new Owner({email,username});
//   const registeredOwner=await Owner.register(owner,password);
//   console.log(registeredOwner)
//   req.flash('success','welcome to yelpcamp')
//   res.redirect('/')


// }
//   catch(e){
//       req.flash('error',e.message)
//       res.redirect('/owners/register')
//   }
 
// });

// app.get('/owners/login',(req,res)=>{
// res.render('owners/login')
// })
// app.post('/owners/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{

// })
app.post("/api/payment/verify",(req,res)=>{

  let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
 
   var crypto = require("crypto");
   var expectedSignature = crypto.createHmac('sha256', '4ZDZdt5hMFGADxI5HhljInw4')
                                   .update(body.toString())
                                   .digest('hex');
                                   console.log("sig received " ,req.body.response.razorpay_signature);
                                   console.log("sig generated " ,expectedSignature);
   var response = {"signatureIsValid":"false"}
   if(expectedSignature === req.body.response.razorpay_signature)
    response={"signatureIsValid":"true"}
       res.send(response);
   });
 
//  app.listen(port, () => {
//    console.log(`Example app listening at http://localhost:${port}`)
//  })
// app.post('/pay', (req, res) => {
//   console.log(req.params)
//   console.log(req.body)
//   const create_payment_json = {
//     "intent": "sale",
//     "payer": {
//         "payment_method": "paypal"
//     },
//     "payee": {
//       "email_address": 'sb-luvha15341713@business.example.com'
//     },
//     "redirect_urls": {
//         "return_url": "http://localhost:3000/success",
//         "cancel_url": "http://localhost:3000/cancel"
//     },
//     "transactions": [{
//         "item_list": {
//             "items": [{
              
//                "salary": "25.00",
//                 "currency": "USD",
               
//             }]
//         },
//         "amount": {
//             "currency": "USD",
//             "total": "25.00"
//         },
        
//     }]
// };

// paypal.payment.create(create_payment_json, function (error, payment) {
//   if (error) {
//       throw error;
//   } else {
//       for(let i = 0;i < payment.links.length;i++){
//         if(payment.links[i].rel === 'approval_url'){
//           res.redirect(payment.links[i].href);
//         }
//       }
//   }
// });

// });

// app.get('/success', (req, res) => {
//   const payerId = req.query.PayerID;
//   const paymentId = req.query.paymentId;

//   const execute_payment_json = {
//     "payer_id": payerId,
//     "transactions": [{
//         "amount": {
//             "currency": "USD",
//             "total": "25.00"
//         }
//     }]
//   };

//   paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
//     if (error) {
//         console.log(error.response);
//         throw error;
//     } else {
//         console.log(JSON.stringify(payment));
//         res.send('Success');
//     }
// });
// });

// app.get('/cancel', (req, res) => res.send('Cancelled'));
app.use('/',ownerRoutes)
app.use('/employees',employeeRoutes)



app.all('*',(req,res,next)=>{
    next(new ExpressError('page not found',404))
})






app.use((err,req,res,next)=>{
  const{statusCode=500}=err;
  if(!err.message) err.message='oh no!'
  res.status(statusCode).render('error',{err})
 
})

 app.listen(3000,()=>{
    console.log('Serving on port 3000')
 })

// var express = require('express');
// var bodyParser = require('body-parser');

// var app = express();
// app.use(bodyParser.urlencoded({extended : true}));
// app.use(bodyParser.json());
// app.get('/',(req,res)=>{
//          res.render('index')
//      })
    
// app.post('/', (req, res) => {
//     console.log(req.body);
//     res.redirect('index')
    
// });
  
// app.listen(3000);