import fs from 'fs';
import mongoose from 'mongoose';
import InventoryItem from '../models/InventorySchema';

const excelToJson = require('convert-excel-to-json');
const path = require('path');
const sharp = require('sharp');

const pathToInventory = './scripts/inventory.xlsx';

if (process.argv.length < 3) {
    console.log("Need at least 3 arguments!!!!");
    process.exit(-1);
}

if (process.argv[2] === 'resize') {
  const folder = path.join(__dirname, '../../inventory_photos/')
  fs.readdir(folder, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        const minPath = path.join(folder, '../minimized');
        sharp(folder+file) 
        .resize(600, 600) 
        .toFile(minPath+'/'+file, (err) => {
          if (err!==null){
            console.error(file, err)
          }
        })
    });
  });
  // process.exit()
}

else if (process.argv[2] === 'parse'){
  // console.log('hello!');

  const result = excelToJson({
    "source": fs.readFileSync(pathToInventory),
    "columnToKey": {
        "A": "item_id",
        "B": "brandName_english",
        "C": "productName_english",
        "D": "brandName_chinese",
        "E": "productName_chinese",
        "F": "description",
        "G": "categories",
        "H": "subcategories",
        "I": "tags",
        "J": "price",
        "K": "weigh",
        "L": "photos"
    }
  });

  const first_sheet = Object.keys(result)[0];
  const inventory = result[first_sheet]; 
  console.log(inventory[0])
  mongoose.Promise = global.Promise;
  mongoose.connection.on('connected', function() {
    console.log('Connected to MONGODB!');
  })
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(
    async () => {
      console.log('uploading to database');
      console.log('files not found: ');
      await Promise.all(inventory.map(async (item) => {

        if(item.item_id === 'END'){
          return;
        }
        let photos = [];
        if (item.photos){
          let photo_dir = item.photos.split(';');
          await photo_dir.map(async (i) => {
            const imgPath = path.join(__dirname, '../../minimized/') + i + '.jpg';
            try {
              let data = fs.readFileSync(imgPath);
              if (data){
                photos.push({
                  uri: new Buffer(data).toString('base64'),
                  name: i
                })
              }
            } catch (err) {
              if(err.code === 'ENOENT'){
                console.log('file not found', i);
              }
            }
          })
        } else {
          console.log('!!!COULD NOT PARSE SPLIT: ', item.item_id, item.brandName_english)
        }

        if (!item.price || item.price.length === 0){
          console.log('NO ITEM PRICE!!!!!', item.item_id, item.brandName_english);
        }
        
        return new InventoryItem({
          item_id: item.item_id,
          brandName: {
            english: item.brandName_english,
            chinese: item.brandName_chinese,
          },
          productName: {
            english: item.productName_english,
            chinese: item.productName_chinese,
          },
          description: item.description,
          categories: item.categories ? item.categories.split(';') : [],
          subcategories: item.subcategories ? item.subcategories.split(';') : [],
          tags: item.tags ? item.tags.split(';') : [],
          price: item.price,
          weigh: item.weigh,
          photos: photos,
        }).save()
      }))
      .then(items => {
        console.log('done!');
        process.exit();
      })
    },
    err => {console.log('ERROR',err)}
  )
}

else if (process.argv[2] === 'getPhoto') {
  async function get(){
    console.log('getting');
    await InventoryItem.findOne({price: 2.69})
    .then(item => {
      console.log('item', item.photos);
    })
    console.log('done');
  }

  get();

}

else if (process.argv[2] === 'categories') {
  const result = excelToJson({
    "source": fs.readFileSync(pathToInventory),
    "columnToKey": {
        "G": "categories",
        "H": "subcategories",
        "I": "tags",
    }
  });

  const first_sheet = Object.keys(result)[0];
  const inventory = result[first_sheet]; 
  console.log(inventory[0])

  const categories = [];
  const subcat = [];
  inventory.forEach(i => {
    const cat = i.categories;
    const sub = i.subcategories ? i.subcategories : ""
    if (!categories.includes(cat)){
      categories.push(cat)
    }

    if (!subcat.includes(sub)){
      subcat.push(sub)
    }
  });

  console.log('categories', categories);
  console.log('subcategories', subcat);
}

// if(process.argv[2] === 'addProperty') {
//   if(process.argv.length < 4) {
//     console.log('need 4 arguments');
//     process.exit(-1);
//   }

//   let arg = process.argv[3];
//   /* READS FROM A FILE AND ADDS PROPERTIES TO THE FILE, THEN WRITES IT TO A NEW FILE*/
//   let rawdata = require(`./public/Inventory/${arg}.json`);

//   /* Add property to rawdata */
//   rawdata.forEach((item) => {
//     item['aisle'] = arg.split('_').join('-').toLowerCase();
//   })
//   /* Stringify and write to a new file */
//   let data = JSON.stringify(rawdata, null, 2);

//   fs.writeFileSync(`./public/New_Inventory/New_${arg}.json`, data)
//   console.log('new file written');
// }

// else if(process.argv[2] === "loadDatabase") {
//   if (!process.env.MONGODB_URI) {
//     console.log('MONGODB_URI config failed');
//     process.exit(1);
//   }

//   mongoose.Promise = global.Promise;
//   mongoose.connection.on('connected', function() {
//     console.log('Connected to MONGODB!');
//   })
//   mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(
//     () => {
//       console.log('loading to database');
//       if(process.argv.length < 4) {
//         console.log('need 4 arguments');
//         process.exit(-1);
//       }

//       let path = process.argv[3]; //path to the directory that we're reading from

//       let inventory = []; //the array of all items

//       function readFiles(path, next, error) {
//         fs.readdir(path, (err, filenames) => {
//             if(err) {
//               error(err);
//               return;
//             }

//             for (var i=0; i<filenames.length; i++) {
//                 console.log(path+'/'+filenames[i]);
//                 const temp = require(path+'/'+filenames[i]);
//                 temp.forEach((item)=>{
//                   inventory.push(item)
//                 })
//             }
//             console.log(`${inventory.length} items`);
//             next(inventory);
//         });
//       }

//       readFiles(path, (inventory) => {
//         console.log('inventory of', inventory.length);

//         // grabs all of the items in inventory and saves it to the database
//         Promise.all(inventory.map((item) => {
//           console.log('item is',item);
//           return new GroceryItem({
//             name: item.ItemName,
//             price: item.Price,
//             description: item.Description,
//             imgURI: item.Pic_URL,
//             aisle: item.aisle
//           }).save()
//         }))

//         .then(items => {
//           console.log('items',items);
//         })
//       }, (err) => {
//         throw err;
//       })
//     },
//     err => {console.log('ERROR',err)}
//   )


// }

else {
  console.log('no script for this');
  process.exit(-1)
}
