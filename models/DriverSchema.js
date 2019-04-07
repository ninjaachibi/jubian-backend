const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const driverSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

export default mongoose.model('Driver', driverSchema);