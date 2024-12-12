import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/pxlNav.js',
  output: [
    {
      file: 'dist/pxlNav.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/pxlNav.esm.js',
      format: 'esm'
    },
    {
      name: 'pxlNav',
      file: 'dist/pxlNav.umd.js',
      format: 'umd'
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    terser()
  ]
};