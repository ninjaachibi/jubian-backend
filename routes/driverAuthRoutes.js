var axios = require('axios');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

import Order from '../models/OrderSchema';

// router.use(function (req, res, next) {
//   var token = req.headers.authorization;

//   if (token === undefined) return res.status(401).json({ success: false, message: 'no jwt token' });

//   var tokenArr = token.split(' ');
//   if (tokenArr[0] !== 'Bearer' || tokenArr[1] === undefined) {
//     return res.status(401).json({ success: false, message: 'Missing bearer or token fields' });
//   }

//   token = tokenArr[1];

//   try {
//     console.log(token);
//     var userInfo = jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     res.status(401).json({ success: false, message: 'Invalid token' });
//     return;
//   }

//   if (userInfo._id === undefined) return res.status(401).json({ success: false, message: 'Could not sign with JWT SECRET' });

//   req.user = userInfo;
//   next();
// });

// Update selected order
router.post('/order/update', (req, res) => {
  let orderId = req.body.orderId;
  console.log('updating order', orderId);

  let update = { status: req.body.status }
  update[req.body.status] = {};
  update[req.body.status]["driver"] = "ray";
  update[req.body.status]["date"] = new Date();

  Order.findByIdAndUpdate(orderId, update, { new: true }, function (err, order) {
    if (err) {
      console.error(err);
      res.json({
        success: false,
        message: "Error!" + err
      });
    } else if (!order) {
      console.log('order', order);
      res.json({
        success: false,
        message: "No order"
      });
    } else {
      //send push notif w/ update
      console.log("updated status is", order.status)
      console.log("order is ", order)
      

      res.json({
        success: true,
        order: order
      })
    }
  })
})

module.exports = router;
