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
      userId: user._id,
      token: jwt.sign(
        { _id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' })
      })
    }
  });
});



export default router;
