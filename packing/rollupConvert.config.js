import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'builds/pxlNav.module.js',
  output: [
    {
      file: 'builds/pxlNav.umd.js',
      format: 'umd',
      name: 'pxlNav'
    },
    {
    file: 'builds/pxlNav.cjs.js',
    format: 'cjs'
  }],
  plugins: [commonjs()]
};