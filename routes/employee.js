const express=require('express');
//const paypal = require('paypal-rest-sdk');
const router=express.Router();
const {isLoggedIn,isAuthor,validateEmployee} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
//const catchAsync=require('../utils/catchAsync');
//const {campgroundSchema}=require('../schemas.js')
//const ExpressError=require('../utils/ExpressError')
const Employee=require('../models/employee');
const employees = require('../controllers/employees');
const passport=require('passport')
const Razorpay = require('razorpay');
/*paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AR5CRs9Oo3Ako7MO818Tgc_GUvBrDqhpmtUJRw8kmBqV8BMJXOMdarCTbJk-Om_CavgK3aTVMK7dsG8m',
  'client_secret': 'EOkAyUbtOhao9FdybaLz3s_bK1W8MF27JQnDdj8Qjz5QjzA0bDITHKjCyWvuulqYpFHQdOL4qhinRajK'
});*/
var instance = new Razorpay({
  key_id: 'rzp_test_z5CdHKLS42pn1W',
  key_secret: '4ZDZdt5hMFGADxI5HhljInw4',
});

router.route('/')
    .get(catchAsync(employees.index))
    .post(isLoggedIn,  catchAsync(employees.createEmployee))


router.get('/new', isLoggedIn, employees.renderNewForm)

router.route('/:id')
    .get(catchAsync(employees.showEmployee))
    .put(isLoggedIn, isAuthor,  catchAsync(employees.updateEmployee))
    .delete(isLoggedIn, isAuthor, catchAsync(employees.deleteEmployee));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(employees.renderEditForm))


    // const isLoggedIn = (req, res, next) => {
    //   if (!req.isAuthenticated()) {
    //       req.session.returnTo = req.originalUrl
    //       req.flash('error', 'You must be signed in first!');
    //       return res.redirect('/login');
    //   }
    //   next();
    // }

   
       router.get('/search',isLoggedIn,catchAsync(employees.search))
       router.get('/search/:id',isLoggedIn,catchAsync(employees.searchId))
    
    router.post('/create/orderId',catchAsync(employees.createOrderId))
 
      

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