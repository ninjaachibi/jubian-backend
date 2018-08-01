const express = require ('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);
const app = express();
const User = require('./models/user.js');
const PORT = process.env.PORT||3000;

if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI config failed');
    process.exit(1);
  }
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
  mongoose.connection.on('error', console.error);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

  app.post('/register', (req, res) => {
    const newUser = new User({
      username: req.body.username,
      password: req.body.password
    });
    newUser.save()
    .then(response => {
      res.send(response);
    })
    .catch(error => {
      res.send(error);
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
            user: user
          })
        }
        });
 
});


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });


const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://${port}`);
})


