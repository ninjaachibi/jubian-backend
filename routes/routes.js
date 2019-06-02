var axios = require('axios');
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

import User from '../models/UserSchema';
import Order from '../models/OrderSchema';
import InventoryItem from '../models/InventorySchema';

import _ from 'underscore'
import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_API_KEY);

router.post('/tempUpdate', async (req, res) => {
  let user = await User.findById(req.body.userId);
  if (user){
    const newHash = await bcrypt.hash(req.body.new, saltRounds);
    let update = {
      password: newHash
    }
    User.findByIdAndUpdate(req.body.userId, update, { new: true }, 
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
      message: "There was an error."
    })
  }
})

router.get('/inventory', (req, res) => {
  console.log('brand', req.query.brand);
  InventoryItem.findOne({brandName: {english: req.query.brand}})
  .then(item => {
    // console.log('item', item);
    if (item.photos[0]){
      console.log(item.photos[0].uri.slice(0,10))
      res.contentType('image/jpeg');
      res.send(item.photos[0].uri);
    } else {
      res.contentType('json');
      res.json('no image');
    }
  })
})

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

router.get('/product', (req, res) => {
  var id = req.query.id;
  console.log('gettig product', id);
  InventoryItem.findOne({item_id: id})
  .then(item => {
    console.log('item', item);
    res.json( { item });
  })
  .catch(err => {
    console.log(err);
    res.json({ error: err })
  })
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
          fullname: req.body.fullname,
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

router.post('/login', async (req, res) => {
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
      .then((hash)=>{
        if (hash) {
          // if authorization succeeds
          console.log('user', user);
          let userObj = {
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            _id: user._id
          }
          res.json({
            success: true,
            userId: user._id,
            userObj: userObj,
            token: jwt.sign(
              userObj,
              process.env.JWT_SECRET,
              { expiresIn: '7d' })
          })
        } else {
          // passwords don't match, authorization failed
          res.json({
            success: false,
            message:"Incorrect password"
          })
        }
      });
    }
  });
});

router.post('/login/token', async (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, function(err, decoded){
    if (err){
      console.log('token has expired')
      res.json({ success: false, error: 'Token expired.  Please log in again.' })
    } else {
      console.log('token is valid!')
      res.json({ success: true });
    }
  })
});

//SEARCH -- browse specific aisles
router.get('/browse', (req,res) => {
  let skipNumber = parseInt(req.query.skip);

  let query = { photos: { $exists: true }, $where: 'this.photos.length>0'};
  query.categories = {$elemMatch: {$in: [ req.query.category ]}};
  if (req.query.subcategories){
    query.subcategories = { $elemMatch: {$in: req.query.subcategories.split(";") } }
    console.log('subcategories', req.query.subcategories);
  }

  InventoryItem
  .find(query)
  .skip(skipNumber)
  .limit(10)
  .then(items => {
    console.log(req.query.category, req.query.subcategories, skipNumber, items.length)
    res.json({ items })
  })
  .catch(err => {
    console.log(err);
    res.json({error: err})
  })
})


//Search --browse certain item
router.get('/searchItem',(req,res) =>{
  let searchItem = req.query.searchItem;
  let skipNumber = parseInt(req.query.skip);
  console.log('query', searchItem);
  let queryObj = {
    $or: [{
      "productName.english": {
        '$regex': searchItem,
        '$options': 'i'
      }
      }, {
      "productName.chinese": {
        '$regex': searchItem,
        '$options': 'i'
      }
      }, {
      "brandName.chinese": {
        '$regex': searchItem,
        '$options': 'i'
      }
      }, {
      "brandName.english": {
        '$regex': searchItem,
        '$options': 'i'
      }
      }, {
      "tags": {
        $in: [ searchItem ]
      }
      }, {
      "subcategories": {
        $in: [ searchItem ]
      }
      }, {
      "categories": {
        $in: [ searchItem ]
      }
      },
    ]
  }

  InventoryItem.find(queryObj)
  .skip(skipNumber)
  .limit(10)
  // InventoryItem.find({ $text: { $search: searchItem, $options: 'i' } })
  .then(items => {
    // console.log(items);
    res.json({items})
  })
  .catch(err => {
    console.log(err)
    res.json({error: err})
  })
})

router.get('/popular',(req,res) =>{
  const query = {
    categories: {$elemMatch: {$in: [ req.query.category ]}}, 
    photos: { $gt: [] }
  };
  let skipNumber = parseInt(req.query.skip);
  InventoryItem.find(query)
  .limit(6)
  .skip(skipNumber)
  // InventoryItem.find({ $text: { $search: searchItem, $options: 'i' } })
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
