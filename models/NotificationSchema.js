const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const notificationSchema = new Schema({
  sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true
  },
  receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  type:{
      type: String,
      enum: ["orderPurchased", "orderInDelivery"],
      required: true
  },
  content: {
      type: String,
      required: true
  },
  is_read: {
      type: Boolean
  },
  read_at: {
      type: Date
  },
  created_at: {
      type: Date,
      default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
