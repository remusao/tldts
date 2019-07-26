import compiler from '@ampproject/rollup-plugin-closure-compiler';
import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default [
  // CommonJS
  {
    input: './dist/es6/index.js',
    output: {
      file: './dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      sourcemaps(),
    ],
  },
  // UMD minified
  {
    input: './dist/es6/index.js',
    output: {
      file: './dist/index.umd.min.js',
      format: 'umd',
      name: 'tldts',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      compiler(),
      sourcemaps(),
    ],
  },
];
