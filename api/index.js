//mongo mongoose
//use empcorner
// db.employees.find() 
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
const express=require('express')

const paypal_client_id=process.env.paypal_client_id
const paypal_client_secret=process.env.paypal_client_secret
const razorpay_key_id=process.env.razorpay_key_id
const razorpay_key_secret=process.env.razorpay_key_secret

const paypal = require('paypal-rest-sdk');
const Razorpay = require('razorpay');
const findOrCreate=require("mongoose-findorcreate")
const GoogleStrategy=require('passport-google-oauth2').Strategy;
const mongoose=require('mongoose')

const Owner=require('../models/owner')
const ExpressError=require('../utils/ExpressError')
const session=require('express-session')
const flash = require('connect-flash-plus');
var methodOverride = require('method-override')

const passport=require('passport')
const LocalStrategy=require('passport-local')
//const paypal=require('paypal')

const ownerRoutes=require('../routes/owner')
const employeeRoutes=require('../routes/employee');

const catchAsync=require('../utils/catchAsync');
const path=require('path');
const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/empcorner'
const GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const sign=process.env.sign;
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

  useUnifiedTopology:true,
 
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


const store=new MongoDBstore({
  mongoUrl:dbUrl,
  secret:'thisshouldbeabettersecret!',
  touchAfter:24*60*60,
})
store.on("error",function(e){
  console.log("SESSION STORE ERROR",e)
})
const sessionConfig={
  store,
  name:'session',
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
    
  }else{
      next();
  }
  }
 
 
    






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
    callbackURL: "https://empcorner.onrender.com/auth/google/callback",
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


