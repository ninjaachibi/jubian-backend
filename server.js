
var axios = require('axios');
import express from 'express';
import bodyParser from 'body-parser';
const app = express();
const PORT = process.env.PORT || 3000;

import { User, GroceryItem } from './models/models'

if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI config failed');
  process.exit(1);
}

import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('connected', function() {
  console.log('Connected to MONGODB!');
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

//AUTH ROUTES
app.post('/register', (req, res) => {
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

app.post('/login',(req,res) =>{
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
app.get('/browse', (req,res) => {
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



app.post('/getTime',async(req,res)=>{

  function splitWaypoints(locationArr){
    var returnStr = ''
    for(var i=0;i<locationArr.length;i++){
      returnStr.concat(locationArr[i]+"|")
    }
    console.log(returnStr)
    return returnStr
  }

  axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        key: process.env.API_KEY,
        origin:req.body.origin,
        waypoints:splitWaypoints(req.body.stops),
        destination: req.body.destination,
      },
    })
    .then((res)=>{
     
      console.log(res.data.routes[0].legs.length)
      console.log()
      console.log(res.data.routes[0].legs[0].duration.text)

    })
    .catch(err =>{
        console.log(err)
    })
    res.json({
      Success:true,
    })
    
})



app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://localhost:${port}`);
})