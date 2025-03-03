// Copy JSDoc dependencies to the output directory

const fs = require('fs');

const fileList = {
  './packing/jsdoc.css' : './docs/jsdoc/styles/jsdoc.css',
  './packing/docs-init.js' : './docs/jsdoc/docs-init.js',
}

const fileKeys = Object.keys(fileList);

fileKeys.forEach( (key)=>{
  console.log(`Copying ${key} to ${fileList[key]}`);
  fs.copyFile( key, fileList[key], (err)=>{
    if(err){
      console.error(`Error copying ${key} to ${fileList[key]}`);
      console.error(err);
    }
  });
});