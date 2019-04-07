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
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  fullname: {
    type: String
  },
  picture: {
    type: {
      date: String,
      uri: String
    }
  }
});

export default mongoose.model('User', userSchema);
