 const express=require('express');
 const router=express.Router();
 const session=require('express-session');
 const passport = require('passport');
 const catchAsync=require('../utils/catchAsync');
 const Owner=require('../models/owner');
const { isLoggedIn } = require('../middleware');
const validator = require("email-validator");
const owners = require('../controllers/owners');
router.route('/register')
    .get(owners.renderRegister)
    .post(catchAsync(owners.register));

router.route('/login')
    .get(owners.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), owners.login)

router.get('/logout', owners.logout)
router.get('/auth/google',passport.authenticate('google', { scope:[ 'email', 'profile' ] }))
router.get('/auth/google/callback',passport.authenticate( 'google', {successRedirect: '/employees',failureRedirect: '/login'}))
 module.exports=router;
