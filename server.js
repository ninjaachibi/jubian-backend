import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const app = express();
const PORT = process.env.PORT || 3000;

import { User } from './models/models'

if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI config failed');
  process.exit(1);
}
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('connected', function() {
  console.log('Connected to MONGODB!');
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

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


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Listening at http://localhost:${port}`);
})
