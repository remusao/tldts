import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';


const plugins = [
  resolve({
    preferBuiltins: false,
  }),
  commonjs(),
];


export default [
  {
    input: './build/tldts.js',
    output: {
      file: pkg.browser,
      name: pkg.name,
      format: 'umd',
    },
    plugins,
  },
  {
    input: './build/tldts.js',
    external: ['punycode'],
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs' },
    ],
  },
];
