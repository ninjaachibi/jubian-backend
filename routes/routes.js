var axios = require('axios');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;


import { User, GroceryItem, Order, Driver } from '../models/models.js'
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_API_KEY);

//test getting users
router.get('/users', (req,res) => {
  console.log('getting users')
  User.find()
    .then((users) => {
      console.log('users',users);
      res.json({
        users: users
      })
    })
    .catch((err) => {
      console.log('ERROR',err);
    });
})

//helper route for checking address 
import getDistance from '../maps/directions.js';

router.post('/checkAddress', async (req, res) => {
  let withinRadius = await getDistance(req.body.address);
  if (withinRadius) {
    res.json({
      success: true,
      message: 'success! address within 10 miles'
    })
    console.log('within 10 miles')
  } else {
    res.json({
      success: false,
      message: 'address not within 10 mile radius'
    })
    console.log('not within 10 miles')
  }
})

//AUTH ROUTES
router.post('/register', (req, res) => {
  console.log('body', req.body);
  User.findOne({username: req.body.username})
  .then(async (user) => {
    console.log('user', user);
    if(user) {
      res.json({
        success: false,
        message: "Username already exists!"
      })
    }
    else {
      bcrypt.hash(req.body.password, saltRounds)
      .then((hash)=>{
        const newUser = new User({
          username: req.body.username,
          password: hash,
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
      })
    }
  })
});

router.post('/login', (req, res) => {
  console.log('booty', req.body)
  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) {
      // there is an error
      console.error(err);
      res.json({
        success: false,
        message: "Error!" + err
      });
    }
    else if (!user) {
      // there is no user
<<<<<<< HEAD
      console.log("user", user);
=======
      console.log("user",user);
>>>>>>> 1f9754a428d57cbedce69f483386a1574af4d1ab
      res.json({
        success: false,
        message: "Invalid user"
      });
    } else {
      // if there is a user, now checking for password
      bcrypt.compare(req.body.password, user.password)
<<<<<<< HEAD
        .then((hash) => {
          if (hash) {
            // if authorization succeeds
            res.json({
              success: true,
              userId: user._id,
              token: jwt.sign(
                { _id: user._id, username: user.username },
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
        });
=======
      .then((hash)=>{
        if (hash) {
          // if authorization succeeds
          res.json({
            success: true,
            userId: user._id,
            token: jwt.sign(
              { _id: user._id, username: user.username },
              process.env.JWT_SECRET,
              { expiresIn: '1d' })
          })
        } else {
          // passwords don't match, authorization failed
          res.json({
            success: false,
            message:"Incorrect password"
          })
        }
      });
>>>>>>> 1f9754a428d57cbedce69f483386a1574af4d1ab
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
      key: process.env.API_KEY, //google API_KEY
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




module.exports = router;
