import compiler from '@ampproject/rollup-plugin-closure-compiler';
import resolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default [
  // cjs
  {
    input: './dist/es6/index.js',
    output: {
        file: './dist/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
      },
    plugins: [resolve(), sourcemaps()],
  },
  // minified esm + umd
  {
    input: './dist/es6/index.js',
    output: [
      {
        file: './dist/index.esm.min.js',
        format: 'esm',
        name: 'tldts',
        sourcemap: true,
      },
      {
        file: './dist/index.umd.min.js',
        format: 'umd',
        name: 'tldts',
        sourcemap: true,
      },
    ],
    plugins: [resolve(), compiler(), sourcemaps()],
  },
];
