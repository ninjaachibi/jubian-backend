var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
import { User, Order } from '../models/models.js';
import getCoords from '../maps/geocoding.js';
import getDistance from '../maps/directions.js';

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



//USERORDER
router.get('/userOrder',(req,res)=>{ //need to make this account for multiple orders
  let userid = req.user._id;
  console.log('userid',userid);
  Order.find({orderedBy:userid})
  .then(order =>{
    console.log(order)
    res.json({order:order,username:req.user.username})
  })
  .catch(err =>{
    console.log(err)
    res.json({err})
  })
})



//ORDER - save order in database
router.post('/Order', async (req,res) => {
  console.log('body', req.body, '\n\n');
  let withinRadius = await getDistance(req.body.address);
  if (withinRadius){
    let geocode = await getCoords(req.body.address);
  
    let items = req.body.items.map(i => {
      let obj = JSON.parse(i);
      return obj;
    });

    const newOrder = new Order({
      totalPrice:req.body.totalPrice,
      userName:req.body.userName,
      ZIP:req.body.ZIP,
      orderedBy: req.user._id, //need to change this to client userId
      address:req.body.address,
      phone:req.body.phone,
      geocode: geocode,
      items: items,
      deliveryLogistics: {
        date: req.body.deliveryLogistics.date,
        time: req.body.deliveryLogistics.time
      }
    })

    newOrder.save()
    .then((order) => {
      console.log('successfully saved order', order);
      res.json({success: true, order})
    })
    .catch(err => {
      console.log('error',err);
      res.json({success: false, message: 'error message:' + err.message})
    })
  } else {
    res.json({
      success: false,
      message: 'address not within 10 mile radius'
    })
  }
})


export default router;
