const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const orderSchema = new Schema({
  totalPrice:{
    type: Number,
  },
  orderedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone:{
      type:String,
      required: true
  },
  address:{
    type:String,
    required: true
  },
  ZIP:{
    type:String,
  },
  orderTime: {
    type: Date,
    default: new Date()
  },
  deliveryLogistics:{
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      enum: ["17:00", "17:30", "18:00", "18:30", "19:00"],
      required: true
    }
  },
  deliveredBy: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  purchasedBy: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  items:[
    {
      name: String,
      count: Number,
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryItem',
        required: true,
      }
    }
  ],
  status: {
    type: String,
    enum: ["ordered", "purchased", "in delivery", "delivered"],
    required: true,
    default: "ordered",
  },
  geocode: {
    type: Object
  },
  ExpoToken: {
    type: String
  }
});

export default mongoose.model('Order', orderSchema);