import compiler from '@ampproject/rollup-plugin-closure-compiler';
import resolve from 'rollup-plugin-node-resolve';

export default [
  // ES6 + UMD + CommonJS minified
  {
    input: './build/es6/index.js',
    output: [
      {
        file: './dist/index.esm.min.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: './dist/index.cjs.min.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: './dist/index.umd.min.js',
        format: 'umd',
        name: 'tldts',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      compiler({
        language_out: 'NO_TRANSPILE',
        warning_level: 'DEFAULT',
      }),
    ],
  },
];
