const mongoose = require('mongoose');
const { Schema } = require('mongoose')

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

export default mongoose.model('GroceryItem', groceryItemSchema);
