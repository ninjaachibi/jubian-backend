var axios = require('axios');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

import Order from '../models/OrderSchema';

router.use(function(req, res, next) {
  var token = req.headers.authorization;

  if (token === undefined) return res.status(401).json({ success: false, message: 'no jwt token' });

  var tokenArr = token.split(' ');
  if (tokenArr[0] !== 'Bearer' || tokenArr[1] === undefined) {
    return res.status(401).json({ success: false, message: 'Missing bearer or token fields' });
  }

  token = tokenArr[1];

  try {
    console.log(token);
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

// Update selected order
router.post('/order/update', (req, res) => {
  let orderId = req.body.orderId;
  console.log('updating order', orderId);

  let update = { status: req.body.status }
  if (req.body.status === "purchased"){
    update["purchasedBy"] = req.user._id;
  } else if (req.body.status === "delivered"){
    update["deliveredBy"] = req.user._id;
  }

  Order.findByIdAndUpdate(orderId, update, { new: true }, function(err, order){
    if (err) {
      console.error(err);
      res.json({
        success:false,
        message: "Error!" + err
      });
    } else if (!order) {
      console.log('order', order);
      res.json({
        success:false,
        message: "No order"
      });
    } else {
      res.json({
        success:true,
        order: order
      })
    }
  })
})




module.exports = router;
