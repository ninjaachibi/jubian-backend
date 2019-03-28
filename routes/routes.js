var axios = require('axios');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

import _ from 'underscore'


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

// *** push notifications *** //

import Expo from 'expo-server-sdk';

// Create a new Expo SDK client
let expo = new Expo();
var somePushTokens = []; 
let messages = [];

// this endpoint should only run once per user
router.post('/users/register-push-token', async (req,res) => {
  const { token, user } = req.body

  //need to save these to database
  const value = token.value
  const username = user.username

  //only push token on if it's not there before
  if (!_.contains(somePushTokens, value)) {
    somePushTokens.push(value)
    console.log('new push token pushed', value)
  }
  else {
    console.log('this token is already registered')
  }

  res.json({
    success: true,
    token,
    user
  })
  console.log('registering for push notifs ', token, user)
})

let tickets = [];

//need to account for chunks, but now let's just do one by one.
router.get('/users/send-push', (req,res) => {  
  for (let pushToken of somePushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      body: 'This is a test notification',
      data: { withSome: 'data' },
    })
  }

  let chunks = expo.chunkPushNotifications(messages);
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('ticketChunk',ticketChunk);
        tickets.push(...ticketChunk); //for receipts

        //if done, clear the messages we have to send
        messages = []
      } catch (error) {
        console.error(error);
      }
    }
  })();
});

let receiptIds = [];

router.get('/users/get-receipts', (req,res) => {
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  console.log('receiptIds', receiptIds)

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      console.log('chunk',chunk)
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log('receipts',receipts);

        for (let r of Object.keys(receipts)) {
          let receipt = receipts[r];
          console.log('receipt', receipt)
          if (receipt.status === 'ok') {
            continue;
          } else if (receipt.status === 'error') {
            console.error(`There was an error sending a notification: ${receipt.message}`);
            if (receipt.details && receipt.details.error) {
              console.error(`The error code is ${receipt.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
});


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
      console.log("user", user);
      res.json({
        success: false,
        message: "Invalid user"
      });
    } else {
      // if there is a user, now checking for password
      bcrypt.compare(req.body.password, user.password)
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
