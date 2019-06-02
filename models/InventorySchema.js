const mongoose = require('mongoose');
const { Schema } = require('mongoose')

// const inventorySchema = new Schema({
//   item_id: {
//       type: String,
//       required: true,
//   },
//   brandName: {
//     type: {
//         english: String,
//         chinese: String
//     }
//   },
//   productName: {
//     type: {
//         english: {
//             type: String,
//             required: true
//         },
//         chinese: String
//     },
//   },
//   categories: {
//       type: [ String ],
//       required: true,
//   },
//   subcategories: {
//       type: [ String ],
//   },
//   tags: {
//       type: [ String ],
//   },
//   description: {
//       type: String,
//   },
//   price: {
//       type: Number,
//       required: true
//   },
//   weigh: {
//       type: String,
//   },
//   photos: {
//       type: [
//           {
//               name: String,  
//               uri: String
//           }
//       ]
//   }
// });

const inventorySchema = new Schema({
    item_id: {
        type: String,
        required: true,
    },
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
    category: {
        type: [ String ],
        required: true,
    },
    subcategory: {
        type: [ String ],
    },
    tags: {
        type: [ String ],
    },
    quantity: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    units: {
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

export default mongoose.model('InventoryItems2', inventorySchema);