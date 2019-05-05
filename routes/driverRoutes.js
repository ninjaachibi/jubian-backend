var axios = require('axios');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

import Order from '../models/OrderSchema';
import Driver from '../models/DriverSchema';

//Driver Register
router.post('/register', (req, res) => {
    console.log('body', req.body);
    Driver.findOne({username: req.body.username})
    .then((driver) => {
      console.log('driver', driver);
      if(driver) {
        res.json({
          success: false,
          message: "Username already exists!"
        })
      }
      else {
        bcrypt.hash(req.body.password, saltRounds)
        .then((hash)=>{
          const newDriver = new Driver({
            username: req.body.username,
            password: hash
          });
          newDriver.save()
          .then(user => {
            res.json({
              success: true,
              message: `Successfully registered a new driver: ${user.username}!`
            });
          })
          .catch(error => {
            res.json({
              success: false,
              message: `Error: ${error}`
            });
          })
        })
      }
    })
  });

//Driver Login
router.post('/login',(req,res) =>{
  console.log('booty', req.body)
  Driver.findOne({username:req.body.username}, function(err, user) {
    if (err) {
      console.error(err);
      res.json({
        success:false,
        message: "Error!" + err
      });
    }
    else if (!user) {
      console.log("user",user);
      res.json({
        success:false,
        message: "Invalid user"
      });
    }
    try {
      bcrypt.compare(req.body.password, user.password)
        .then((hash) => {
          if (hash) {
            // if authorization succeeds
            let userObj = {
              username: user.username,
              _id: user._id
            }
            res.json({
              success: true,
              driverInfo: {
                _id: user._id,
                username: user.username
              },
              token: jwt.sign(
                userObj,
                process.env.JWT_SECRET,
                { expiresIn: '1d' })
            })
          } else {
            // passwords don't match, authorization failed
            res.json({
              success: false,
              message: "Incorrect password"
            })
          }
        })
    } catch (error) { console.error(err) }
});
});

//Driver Orders
router.get('/orders',(req,res) =>{
  console.log('orders', req.body)
  Order.find({ 
    status:{$in: ['ordered', 'purchased', 'in_delivery']},
  })
       .populate('orderedBy')
       .exec(function(err, orders){
          if (err) {
            console.error(err);
            res.json({
              success:false,
              message: "Error!" + err
            });
          } 
          else if (!orders) {
            console.log('order', orders);
            res.json({
              success:false,
              message: "No orders"
            });
          }
          else {
            console.log('orders', orders);
            res.json({
              success:true,
              orders: orders
            })
          }
       })
});

module.exports = router;
