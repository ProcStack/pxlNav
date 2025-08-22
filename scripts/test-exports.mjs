import pkg from '../dist/pxlNav.esm.js';
console.log('ESM import loaded, keys:', Object.keys(pkg).slice(0,10));
// Also test package import
import * as fromPkg from '../dist/pxlNav.esm.js';
console.log('ESM named keys:', Object.keys(fromPkg).slice(0,10));
