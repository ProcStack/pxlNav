import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'dist/pxlNav.esm.js',
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
      file: 'dist/pxlNav.cjs.js',
      format: 'cjs'
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