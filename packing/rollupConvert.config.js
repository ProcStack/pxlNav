import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'dist/pxlNav.esm.js',
  output: [
    {
      file: 'dist/pxlNav.umd.js',
      format: 'umd',
      name: 'pxlNav'
    },
    {
    file: 'dist/pxlNav.cjs.js',
    format: 'cjs'
  }],
  plugins: [commonjs()]
};