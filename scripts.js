import fs from 'fs';

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
  console.log('uploading to database');
  if(process.argv.length < 4) {
    console.log('need 4 arguments');
    process.exit(-1);
  }

  let path = process.argv[3];

  let inventory = [];

  function readFiles(path, next, error) {
    fs.readdir(path, function(err, filenames) {
        // console.log(filenames);

        for (var i=0; i<filenames.length; i++) {
            console.log(path+'/'+filenames[i]);
            const temp = require(path+'/'+filenames[i]);
            temp.forEach((item)=>{
              inventory.push(item)
            })
        }
        console.log(`${inventory.length} items`);
        // console.log(inventory);
    });
  }
}

else {
  console.log('no script for this');
  process.exit(-1)
}
