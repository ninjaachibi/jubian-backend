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
  },
  email:{
    type: String,
  },
  phone: {
    type: String,
  },
  fullname: {
    type: String
  },
  profile_picture: {
    type: String
  }
});

export default mongoose.model('User', userSchema);
