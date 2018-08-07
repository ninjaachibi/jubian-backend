var axios = require('axios');
var express = require('express');
var router = express.Router();
import { User, GroceryItem, Order } from '../models/models.js'


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
          password: req.body.password
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
        userId: user._id
      })
    }
    });
  });
  
  //SEARCH
  router.get('/browse', (req,res) => {
    let aisle = req.query.aisle;
    console.log('aisle', aisle);
    GroceryItem.find({aisle})
    .then(items => {
      console.log(items);
      res.json({items})
    })
    .catch(err => {
      console.log(err);
      res.json({error: err})
    })
  
  })
  
  
  //ORDER
  router.post('/Order',(req,res) =>{
    const newOrder = new Order({
      totalPrice:req.body.totalPrice,
      orderedBy:User._id,
      address:req.body.address
    })
  
    newOrder.save(function(err){
      if(err){
        console.log("Error",err)
      }
      else{
        res.json({
          success:true
        })
        Order.find({})
        .populate('orderedBy')
        .exec(function(error,orders){
          console.log(JSON.stringify(orders, null, "\t"))
        })
      }
    })
  })
  
  
  //TravelTime & Google API
  router.post('/travelTime',async(req,res)=>{
  
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
  
    let s = splitWaypoints(locationArray)
    
  
  
    axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          key: process.env.API_KEY,
          origin:req.body.origin,
          waypoints: s,
          destination: req.body.destination,
        },
      })
      .then((response)=>{
        let resultArray = () =>{
          var returnArr =[];
         for(var i=0;i<response.data.routes[0].legs.length;i++){
  
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
        // console.log(res.data.routes[0].legs[1].duration.text)
        // console.log(res.data.routes[0].legs[2].duration.text)
        let jspnObj = resultArray()
        res.json({jspnObj}
        )
       
      }
        
      )
      .catch(err =>{
          console.log(err)
      })
      // res.json({
      //   success:true
      // })
  })
  
  module.exports = router;