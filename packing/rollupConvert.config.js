import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

// Convert the ESM bundle produced by esbuild into CJS and (optionally) UMD.
// Keep `three` external so consumers provide their own copy.
export default {
  input: 'builds/pxlNav.module.js',
  external: ['three'],
  output: [
    {
      file: 'builds/pxlNav.cjs.js',
      format: 'cjs',
      sourcemap: false
    },
    {
      file: 'builds/pxlNav.umd.js',
      format: 'umd',
      name: 'pxlNav',
      globals: { three: 'THREE' },
      sourcemap: false
    }
  ],
  plugins: [
    // Resolve node-style imports (so rollup can find deps if needed)
    resolve(),
    // Convert CommonJS modules (if any) to ES modules for Rollup
    commonjs(),
    // Minify final outputs
    terser()
  ]
};