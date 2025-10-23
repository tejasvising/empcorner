const express=require('express');

const router=express.Router();
const {isLoggedIn,isAuthor,validateEmployee} = require('../middleware');
const catchAsync = require('../utils/catchAsync');

const Employee=require('../models/employee');
const employees = require('../controllers/employees');
const passport=require('passport')
const Razorpay = require('razorpay');

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


   

   
       router.get('/search',isLoggedIn,catchAsync(employees.search))
       router.get('/search/:id',isLoggedIn,catchAsync(employees.searchId))
    
    router.post('/create/orderId',catchAsync(employees.createOrderId))
 
      




module.exports=router;
