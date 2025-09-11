const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../builds/pxlNav.esm.js');
const searchValue = '__webpack_require__(541)';
const replaceValue = 'import';

// Copy `filePath`` to ./dist & ./examples/js
const destPaths = [
  filePath,
  path.join(__dirname, '../dist/pxlNav.esm.js'),
  path.join(__dirname, '../examples/esm/js/pxlNav.esm.js')
];


fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  return;

  /*const foundSearchValue = data.includes(searchValue);
  if (!foundSearchValue) {
    console.warn(`!!!!!!!!!!!`);
    console.warn(`Search value "${searchValue}" not found in ${filePath}. No changes made.`);
    return;
  }*/

  //const result = data.replace(searchValue, replaceValue);
  const result = data;

  destPaths.forEach((destPath) => {
    console.log(`Writing modified file to: ${destPath}`);
    fs.writeFile(destPath, result, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
    });
  });
});

// -- -- --


