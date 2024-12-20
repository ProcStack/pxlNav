import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'dist/pxlNav.umd.js',
  output: {
    file: 'dist/pxlNav.cjs.js',
    format: 'cjs'
  },
  plugins: [commonjs()]
};