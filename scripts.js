import fs from 'fs';
import mongoose from 'mongoose';
import { User, GroceryItem } from './models/models'

console.log(process.argv.length);

if (process.argv.length < 3) {
    console.log("Need at least 3 arguments!!!!");
    process.exit(-1);
}

if(process.argv[2] === 'addProperty') {
  if(process.argv.length < 4) {
    console.log('need 4 arguments');
    process.exit(-1);
  }

  let arg = process.argv[3];
  /* READS FROM A FILE AND ADDS PROPERTIES TO THE FILE, THEN WRITES IT TO A NEW FILE*/
  let rawdata = require(`./public/Inventory/${arg}.json`);

  /* Add property to rawdata */
  rawdata.forEach((item) => {
    item['aisle'] = arg.split('_').join('-').toLowerCase();
  })
  /* Stringify and write to a new file */
  let data = JSON.stringify(rawdata, null, 2);

  fs.writeFileSync(`./public/New_Inventory/New_${arg}.json`, data)
  console.log('new file written');
}

else if(process.argv[2] === "loadDatabase") {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI config failed');
    process.exit(1);
  }

  mongoose.Promise = global.Promise;
  mongoose.connection.on('connected', function() {
    console.log('Connected to MONGODB!');
  })
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(
    () => {
      console.log('loading to database');
      if(process.argv.length < 4) {
        console.log('need 4 arguments');
        process.exit(-1);
      }

      let path = process.argv[3]; //path to the directory that we're reading from

      let inventory = []; //the array of all items

      function readFiles(path, next, error) {
        fs.readdir(path, (err, filenames) => {
            if(err) {
              error(err);
              return;
            }

            for (var i=0; i<filenames.length; i++) {
                console.log(path+'/'+filenames[i]);
                const temp = require(path+'/'+filenames[i]);
                temp.forEach((item)=>{
                  inventory.push(item)
                })
            }
            console.log(`${inventory.length} items`);
            next(inventory);
        });
      }

      readFiles(path, (inventory) => {
        console.log('inventory of', inventory.length);
        Promise.all(inventory.map((item) => {
          console.log('item is',item);
          return new GroceryItem({
            name: item.ItemName,
            price: item.Price,
            description: item.Description,
            imgURI: item.Pic_URL,
            aisle: item.aisle
          }).save()
        }))
        .then(items => {
          console.log('items',items);
        })
      }, (err) => {
        throw err;
      })
    },
    err => {console.log('ERROR',err)}
  )


}

else {
  console.log('no script for this');
  process.exit(-1)
}
