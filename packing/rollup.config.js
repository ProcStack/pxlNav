import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'builds/pxlNav.module.js',
  external: id => {
    console.log(`Testing external for ID: ${id}`);
    const isExternal = /^(three|\.\/libs)/.test(id);
    if (isExternal) {
      console.log(`External module: ${id}`);
    }
    return isExternal;
  },
  output: [
    {
      file: 'builds/pxlNav.cjs.js',
      format: 'cjs'
    },
    {
      name: 'pxlNav',
      file: 'builds/pxlNav.umd.js',
      format: 'umd'
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    terser()
  ]
};