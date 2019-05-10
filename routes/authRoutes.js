var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

import Order from '../models/OrderSchema';
import User from '../models/UserSchema';

import getCoords from '../maps/geocoding.js';

router.use(function(req, res, next) {
  var token = req.headers.authorization;

  if (token === undefined) return res.status(401).json({ success: false, message: 'no jwt token' });

  var tokenArr = token.split(' ');
  if (tokenArr[0] !== 'Bearer' || tokenArr[1] === undefined) {
    return res.status(401).json({ success: false, message: 'Missing bearer or token fields' });
  }

  token = tokenArr[1];

  try {
    // console.log(token);
    var userInfo = jwt.verify(token, process.env.JWT_SECRET);
  } catch(err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
  /*
  { _id: "fsvnssd", username: "hello" }
  */
  if (userInfo._id === undefined) return res.status(401).json({ success: false, message: 'Could not sign with JWT SECRET' });

  req.user = userInfo;
  next();
});

// USER INFO
router.get('/userInfo', (req, res) => {
  res.json(req.user);
})

// UPDATE USER INFO
router.post('/user/update', (req, res) => {
  const updateObj = {
    // username: req.body.username,
    phone: req.body.phone,
    fullname: req.body.fullname,
    // picture: req.body.picture
  }

  console.log('updating');

  User.findByIdAndUpdate(req.user._id, updateObj, { new: true }, 
    (err, user) => {
      if (err){
        console.error(err);
        res.json({
          success: false,
          message: "Error!" + err
        })
      } else if (!user){
        res.json({
          success: false,
          message: "No user"
        });
      } else {
        res.json({
          success: true,
          user: user
        })
      }
    }
  )
})

router.post('/updatePassword', async (req, res) => {
  let user = await User.findById(req.user._id);
  if (user){
    const hash = await bcrypt.compare(req.body.old, user.password);
    if (hash) {
      const newHash = await bcrypt.hash(req.body.new, saltRounds);
      let update = {
        password: newHash
      }
      User.findByIdAndUpdate(req.user._id, update, { new: true }, 
      (err, user) => {
        if (err){
          console.error(err);
          res.json({
            success: false,
            message: err
          })
        } else if (!user){
          res.json({
            success: false,
            message: "No such user."
          });
        } else {
          res.json({
            success: true,
            user: user
          })
        }
      })
    } else {
      res.json({
        success: false,
        message: 'Incorrect password.'
      })
    }
  } else {
    res.json({
      success: false,
      message: "There was an error."
    })
  }
})

//USERORDER - finds all
router.get('/userOrder',(req,res)=>{ 
  let userid = req.user._id;
  console.log('userid',userid);
  Order.find({orderedBy:userid})
  .then(orders =>{
    console.log(orders)
    res.json({orders:orders,username:req.user.username})
  })
  .catch(err =>{
    console.log(err)
    res.json({err})
  })
})

// get ONE user order
router.post('/userOrder/one',(req,res)=>{ 
  Order.findById(req.body.orderId)
  .then(order =>{
    console.log(order)
    res.json({order:order,username:req.user.username})
  })
  .catch(err =>{
    console.log(err)
    res.json({err})
  })
})

// get whether the user has ordered before
router.get('/userOrder/checkhistory',(req,res)=>{ 
  let userid = req.user._id;
  Order.find({orderedBy:userid})
  .limit(1)
  .then(order =>{
    console.log('in check history', order);
    if (order.length > 0){
      res.json({
        first_time: false
      })
    } else {
      res.json({
        first_time: true
      })
    }
  })
  .catch(err =>{
    console.log(err)
    res.json({err})
  })
})

//ORDER - save order in database
router.post('/Order', async (req,res) => {
  console.log('body', req.body, '\n\n');
  let geocode = await getCoords(req.body.address);

  const newOrder = new Order({
    price: {
      base: req.body.price.base,
      small_order: req.body.price.small_order,
      tax: req.body.price.tax,
      delivery: req.body.price.delivery,
      total: req.body.price.total
    },
    userName:req.body.userName,
    ZIP:req.body.ZIP,
    orderedBy: req.user._id, //need to change this to client userId
    address: {
      address: req.body.address.address,
      city: req.body.address.city,
      ZIP: req.body.address.ZIP,
    },
    phone:req.body.phone,
    geocode: geocode,
    items: req.body.items,
    deliveryLogistics: {
      date: req.body.deliveryLogistics.date,
      time: req.body.deliveryLogistics.time
    },
    ExpoToken: req.body.ExpoToken
  })

  newOrder.save()
  .then((order) => {
    // console.log('successfully saved order', order);
    res.json({success: true, order})
  })
  .catch(err => {
    console.log('error',err);
    res.json({success: false, message: 'error message:' + err.message})
  })

})


export default router;
