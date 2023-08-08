//mongo mongoose
//use empcorner
// db.employees.find() 
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
const express=require('express')
//var bodyParser = require('body-parser')
const paypal_client_id=process.env.paypal_client_id
const paypal_client_secret=process.env.paypal_client_secret
const razorpay_key_id=process.env.razorpay_key_id
const razorpay_key_secret=process.env.razorpay_key_secret



const paypal = require('paypal-rest-sdk');
const Razorpay = require('razorpay');
const findOrCreate=require("mongoose-findorcreate")
const GoogleStrategy=require('passport-google-oauth2').Strategy;
const mongoose=require('mongoose')
const Employee=require('./models/employee');
const Owner=require('./models/owner')
const ExpressError=require('./utils/ExpressError')
const session=require('express-session')
const flash = require('connect-flash-plus');
var methodOverride = require('method-override')

const passport=require('passport')
const LocalStrategy=require('passport-local')
//const paypal=require('paypal')

const ownerRoutes=require('./routes/owner')
const employeeRoutes=require('./routes/employee');

const catchAsync=require('./utils/catchAsync');
const path=require('path');
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const dbUrl=  process.env.DB_URL
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const sign=process.env.sign;


 
// Don't redirect if the hostname is `localhost:port` or the route is `/insecure`

//const MongoStore = require('connect-mongo');
//'mongodb://localhost:27017/empcorner'
//mongoose.connect('mongodb://localhost:27017/empcorner',
 // err => {
 //     if(err) throw err;
 //     console.log('connected to MongoDB')
 // });
const MongoDBstore = require("connect-mongo");
mongoose.connect(dbUrl,{
 useNewUrlParser:true,
 //useCreateIndex:true,
  useUnifiedTopology:true,
 //useFindAndModify:false,
});
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
app.use(mongoSanitize());
app.use(flash());
app.use(helmet());




const scriptSrcUrls = [
  "https://checkout.razorpay.com/v1/checkout.js",
  "https://code.jquery.com/jquery-3.5.1.slim.min.js",
  "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
  "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.razorpay.com",
  "https://razorpay.com/",
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
  "https://lumberjack-cx.razorpay.com/beacon/v1/batch?writeKey=2Fle0rY1hHoLCMetOdzYFs1RIJF",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dcjk8v4fi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com",
          ],
          frameSrc:["'self'", ...connectSrcUrls],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

// app.use(bodyParser.urlencoded());
// app.use(bodyParser.urlencoded({extended : true}));
// app.use(bodyParser.json());


const store=new MongoDBstore({
  mongoUrl:dbUrl,
  secret:secret,
  touchAfter:24*60*60,
})
store.on("error",function(e){
  console.log("SESSION STORE ERROR",e)
})


const sessionConfig={
  store:store,
  name:'session',
  secret:'thisshouldbeabettersecret!',
  resave:false,
  saveUninitialized:true,
  cookie:{
      httpOnly:true,
      //secure:true,
      express:Date.now()+1000*60*60*24*7,
      maxAge:1000*60*60*24*7
  }
}

app.use(session(sessionConfig))


app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(Owner.authenticate()))

passport.serializeUser(Owner.serializeUser())
passport.deserializeUser(Owner.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.messages=req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  
  next();
})

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
      req.flash('error', msg);
     // throw new ExpressError(msg,400)
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


//paypal.configure({
 // 'mode': 'sandbox', //sandbox or live
 // 'client_id': paypal_client_id,
 // 'client_secret': paypal_client_secret
//});


var instance = new Razorpay({
  key_id: razorpay_key_id,
  key_secret: razorpay_key_secret,
});

app.get('/', (req, res) => {
  res.render('home')
});

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    Owner.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));



app.post("/api/payment/verify",(req,res)=>{

  let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
 
   var crypto = require("crypto");
   var expectedSignature = crypto.createHmac('sha256', sign)
                                   .update(body.toString())
                                   .digest('hex');
                                   console.log("sig received " ,req.body.response.razorpay_signature);
                                   console.log("sig generated " ,expectedSignature);
   var response = {"signatureIsValid":"false"}
   if(expectedSignature === req.body.response.razorpay_signature)
    response={"signatureIsValid":"true"}
       res.send(response);
   });
   app.use(express.urlencoded({extended: true}))
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
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Serving on port ${port}`)
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
