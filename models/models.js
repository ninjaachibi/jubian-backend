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
  }
});

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

const orderSchema = new Schema({
  totalPrice:{
    type: Number,
  },
  orderedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address:{
    type:String,
    required: true
  },
  time: {
    type: Date,
    default: new Date()
  },
  deliveredBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  items:[
    {
      name: String,
      count: Number
    }
  ]

  
});


const groceryItemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  imgURI: {
    type: String
  },
  aisle: {
    type: String
  }
})

let User = mongoose.model('User', userSchema);
let Driver = mongoose.model('Driver', driverSchema);
let GroceryItem = mongoose.model('GroceryItem', groceryItemSchema);
let Order = mongoose.model('Order', orderSchema);

export { User, GroceryItem, Order,Driver };
