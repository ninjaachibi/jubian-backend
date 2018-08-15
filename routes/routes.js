var axios = require('axios');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();

import { User, GroceryItem, Order, Driver } from '../models/models.js'
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_API_KEY);



//AUTH ROUTES
router.post('/register', (req, res) => {
  console.log('body', req.body);
  User.findOne({username: req.body.username})
  .then((user) => {
    console.log('user', user);
    if(user) {
      res.json({
        success: false,
        message: "Username already exists!"
      })
    }
    else {
      const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        phone: req.body.phone,
        email: req.body.email,
      });
      newUser.save()
      .then(user => {
        res.json({
          success: true,
          message: `Successfully registered a new user: ${user.username}!`
        });
      })
      .catch(error => {
        res.json({
          success: false,
          message: `Error: ${error}`
        });
      })
    }
  })
});

router.post('/login',(req,res) =>{
  console.log('booty', req.body)
  User.findOne({username:req.body.username}, function(err, user) {
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
    //if passwords don't match, authorization failed
    else if (user.password !== req.body.password) {
      res.json({
        success: false,
        message:"Incorrect password"
      })
    }
    else{ console.log({user:req.body})
    //if authorization succeeds
    res.json({
      success: true,
      userId: user._id,
      token: jwt.sign(
        { _id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' })
      })
    }
  });
});

//SEARCH -- browse specific aisles
router.get('/browse', (req,res) => {
  let aisle = req.query.aisle;
  console.log('aisle', aisle);
  GroceryItem.find({aisle})
  .then(items => {
    res.json({items})
  })
  .catch(err => {
    console.log(err);
    res.json({error: err})
  })
})


//Search --browse certain item
router.get('/searchItem',(req,res) =>{
  let searchItem = req.query.searchItem;
  console.log('query', searchItem);
  GroceryItem.find({name: {$regex : searchItem, $options: 'i'}})
  .then(items => {
    // console.log(items);
    res.json({items})
  })
  .catch(err => {
    console.log(err)
    res.json({error: err})
  })
})

//For stripe payments
router.post('/payments', function(req, res){
  console.log('payment request..', req.body)
  var token = req.body.stripeToken; // Using Express
  //Charge the user's card:
  var charge = stripe.charges.create({
    amount: Math.round(req.body.total * 100),
    currency: "usd",
    description: "test charge", //change to user and items
    source: token,
  }, function(err, charge) {
    if(err) {
      console.log(err);
      res.json({success: false, message: err.message})
    } else {
      console.log('success payment', charge);
      res.json({success: true, charge})
    }
  });
});


//TravelTime & Google API
/* required params:
origin: String
destination: String
*/
router.post('/travelTime', async(req,res)=>{

  function splitWaypoints(locationArr){
    console.log('hiihifhi')
    var returnStr = locationArr.join('|')
    console.log(returnStr)
    return returnStr
  }

  let orderArray = ['5b68ec6844a3bb6e0ced441b','5b68ed6344a3bb6e0ced441c','5b68ed7844a3bb6e0ced441d']
  let results = await Promise.all(orderArray.map(orderId => Order.findById(orderId)));
  var locationArray = results.map(order => order.address);
  console.log(locationArray)



  axios.get('https://maps.googleapis.com/maps/api/directions/json', {
    params: {
      key: process.env.API_KEY,
      origin:req.body.origin,
      waypoints: splitWaypoints(locationArray),
      destination: req.body.destination,
    },
  })
  .then((response)=>{
    let resultArray = () =>{
      var returnArr =[];
      for(var i = 0; i < response.data.routes[0].legs.length; i++) {

        returnArr.push({
          time: {
            value:response.data.routes[0].legs[i].duration.value,
            text:response.data.routes[0].legs[i].duration.text
          },
          id:orderArray[i]
        })
      }
      console.log(returnArr)
      return returnArr
    }
    console.log(response.data.routes[0].legs[0].duration.text)
    let jspnObj = resultArray()
    res.json({data: jspnObj}
    )

  }

)
.catch(err => {
    console.log(err)
  })
})

//Driver Register
router.post('/driverRegister', (req, res) => {
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
        const newDriver = new Driver({
          username: req.body.username,
          password: req.body.password
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
      }
    })
  });


  //Driver Login
  router.post('/driverLogin',(req,res) =>{
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
      //if passwords don't match, authorization failed
      else if (user.password !== req.body.password) {
        res.json({
          success: false,
          message:"Incorrect password"
        })
      }
      else{ console.log({user:req.body})
      //if authorization succeeds
      res.json({
        success: true,
        driverId: user._id
      })
    }
  });
  });


//RenderAvaliableOrder
//router.post('/selectOrder',)




module.exports = router;
