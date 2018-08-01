const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const userSchema = new Schema({

  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});


let User = mongoose.model('User', userSchema);
module.exports=User;
