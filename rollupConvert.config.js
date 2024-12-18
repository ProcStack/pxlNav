import commonjs from 'rollup-plugin-commonjs';
console.log("hit");
export default {
  input: 'dist/pxlNav.umd.js',
  output: {
    file: 'dist/pxlNav.cjs.js',
    format: 'cjs'
  },
  plugins: [commonjs()]
};