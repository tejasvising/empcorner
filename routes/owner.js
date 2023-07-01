 const express=require('express');
 const router=express.Router();
 const passport = require('passport');
 const catchAsync=require('../utils/catchAsync');
 const Owner=require('../models/owner');

 router.get('/register',(req,res)=>{
     res.render('owners/register')
 })

 router.post('/register',async(req,res)=>{
     try{
         const {email,username,password}=req.body;
     const owner=new Owner({email,username});
    // owner.author=req.user._id;
   
     const registeredOwner=await Owner.register(owner,password);
     console.log(registeredOwner)
     console.log(req.user._id)
     req.flash('success','welcome to yelpcamp');
     const redirectUrl = req.session.returnTo || '/employees';
     res.redirect(redirectUrl);
return redirectUrl;

 }
     catch(e){
         req.flash('error',e.message)
         res.redirect('register')
     }
   
 });

 router.get('/login',(req,res)=>{
 res.render('owners/login')
 })
 router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success', 'welcome back!');
    
    const redirectUrl = req.session.returnTo || '/employees';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
 })
 router.get('/logout', (req,res)=>{
     
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/login');
 })
 module.exports=router;
