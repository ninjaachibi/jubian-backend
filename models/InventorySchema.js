const mongoose = require('mongoose');
const { Schema } = require('mongoose')

const inventorySchema = new Schema({
  brandName: {
    type: {
        english: String,
        chinese: String
    }
  },
  productName: {
    type: {
        english: {
            type: String,
            required: true
        },
        chinese: String
    },
  },
  categories: {
      type: [ String ],
      required: true
  },
  description: {
      type: String,
      required: true
  },
  price: {
      type: Number,
      required: true
  },
  weigh: {
      type: String,
  },
  photos: {
      type: [
          {
              name: String,  
              uri: String
          }
      ]
  }
});

export default mongoose.model('InventoryItem', inventorySchema);