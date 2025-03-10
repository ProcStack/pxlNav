const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../builds/pxlNav.esm.js');
const searchValue = '__webpack_require__(541)';
const replaceValue = 'import';

// Copy `filePath`` to ./dist & ./examples/js
const destPaths = [
  filePath,
  path.join(__dirname, '../dist/pxlNav.esm.js'),
  path.join(__dirname, '../examples/js/pxlNav.esm.js')
];


fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const result = data.replace(searchValue, replaceValue);

  destPaths.forEach((destPath) => {
    fs.writeFile(destPath, result, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
    });
  });
});

// -- -- --


