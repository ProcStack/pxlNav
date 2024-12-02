// Iterate the repo's file structure and generate a `fileTree.txt` file in the `./docs` folder
//   I'm between adding the files after the folders, currently files before folders.
//     I like File first me thinks, easier to spot the important files in pxlNav near the top of the fileTree that way.

const fs = require('fs');
const path = require('path');

let folderEntries = {};

let outputPath = './docs/fileTree.txt';

// Top most folder entry
//   "." will be replaced with the `rootFolderName`
let rootFolderName = 'pxlNav Root --';


// Indentation Strings -
let indent_dir = '= ./';
let indent_file = '  -';
let indent_rootFile = ' -';
let indent_bar = '│  ';
let indent_endFileBar = '└─ ';


// Gather Folders and Files
function generateFileTree(depth, dir) {
  const files = fs.readdirSync(dir);
  if( !folderEntries[dir] ){
    let newEntry = {
      "depth" : depth,
      "folders" : {},
      "files" : {}
    };
    folderEntries[dir] = newEntry;
  }
  let runner = 0;
  let nextDepth = depth+1;

  files.forEach((file, index) => {
    // Folder and File Exclusions
    //   TODO : Add a loop to iterate an array of exclusions
    if( file.includes('node_modules') || file.includes('.git') || file.includes('libs') || file.includes('docs') ){
      return;
    }

    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      folderEntries[dir]["folders"][file] = filePath;
      generateFileTree( nextDepth, filePath );
    }else{
      folderEntries[dir]["files"][file] = filePath;
    }

    ++runner;
    if(runner>100){
      process.exit(0);
    }
  });
}

// Traverse the files structure from root '.'
generateFileTree(0, '.');


let filePrintString = [];

let entryKeys = Object.keys(folderEntries);


entryKeys.forEach( (entry) => {
  let entryObj = folderEntries[entry];
  let entryKeys = Object.keys(entryObj);
  let curEntry = entry;
  let isRoot = false;
  if( entry === '.' ){
    isRoot = true;
    curEntry = rootFolderName;
  }else{
    curEntry = curEntry.replace(/\\/g, "/");
  }
  let curString = "";
  if( entryObj["depth"]>0 ){
    curString = indent_bar.repeat(entryObj["depth"]-1) + indent_dir;
    curString += curEntry;
  }else{
    curString = curEntry;
  }

  filePrintString.push( curString );
  if( !isRoot ){
    let curFiles = Object.keys(entryObj["files"]);
    curFiles = curFiles.sort();
    let curRun = 0;
    curFiles.forEach( (file) => {
      ++curRun;
      // Add file Indentation Strings
      //   Check for last file in folder to add endFileBar
      let curIndent = curRun === curFiles.length ? indent_bar.repeat(entryObj["depth"]-1)+indent_endFileBar  : indent_bar.repeat(entryObj["depth"]) ;
      let curFileStr = curIndent + indent_file + file;
      filePrintString.push( curFileStr );
    });
  }
});

// Put root files at the end of the tree since they are repo managerial generally
let curFiles = Object.keys(folderEntries['.']["files"]);
curFiles = curFiles.sort();
curFiles.forEach( (file) => {
  let curFileStr = indent_rootFile + file;
  filePrintString.push( curFileStr );
});

let fileStrOut = filePrintString.join('\r\n');


// Output
console.log(filePrintString);
fs.writeFileSync(outputPath, fileStrOut);