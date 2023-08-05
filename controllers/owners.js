const Owner = require('../models/owner');
const validator = require("email-validator");
const express=require('express');
const router=express.Router();
const session=require('express-session');
const passport = require('passport');
const catchAsync=require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');
module.exports.renderRegister = (req, res) => {
    res.render('owners/register');
}



module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const owner = new Owner({ email, username });
        if(!validator.validate(email)) {
            req.flash('error','invalid email'); 
           res.redirect('register');
         }
        const registeredOwner = await Owner.register(owner, password);
        req.login(registeredOwner, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Empcorner!');
            res.redirect('/employees');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('owners/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/employees';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/');
}