var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
import { User, Order } from '../models/models.js'

router.use(function(req, res, next) {
  var token = req.headers.authorization;
  if (token === undefined) return res.status(401).json({ success: false });

  var tokenArr = token.split(' ');
  if (tokenArr[0] !== 'Bearer' || tokenArr[1] === undefined) {
    return res.status(401).json({ success: false });
  }

  token = tokenArr[1];

  var userInfo = jwt.verify(token, process.env.JWT_SECRET);
  /*
  { _id: "fsvnssd", username: "hello" }
  */
  if (userInfo._id === undefined) return res.status(401).json({ success: false });

  req.user = userInfo;
  next();
});


//USERORDER
router.get('/userOrder',(req,res)=>{
  let userid = req.user._id;
  console.log('userid',userid);
  Order.findOne({orderedBy:userid})
  .then(order =>{
    console.log(order)
    res.json({order})
  })
  .catch(err =>{
    console.log(err)
    res.json({err})
  })
})

//ORDER - save order in database
router.post('/Order',(req,res) =>{
  const newOrder = new Order({
    totalPrice:req.body.totalPrice,
    orderedBy: req.user._id, //need to change this to client userId
    address:req.body.address,
    item:req.body.item
  })

  newOrder.save(function(err) {
    if(err){
      console.log("Error", err)
    }
    else{
      res.json({
        success:true
      })
      Order.find({})
      .populate('orderedBy')
      .exec(function(error,orders) {
        console.log(JSON.stringify(orders, null, "\t"))
      })
    }
  })
})

//For stripe payments
router.post('/payments', function(req, res){
  console.log('payment request..', req.body)
  var token = req.body.stripeToken; // Using Express
  //Charge the user's card:
  var charge = stripe.charges.create({
    amount: req.body.total * 100,
    currency: "usd",
    description: "test charge", //change to user and items
    source: token,
  }, function(err, charge) {
    if(err) {
      console.log(err);
      res.json({success: false})
    } else {
      console.log('success payment', charge);
      res.json(charge)
    }
  });
});





export default router;
