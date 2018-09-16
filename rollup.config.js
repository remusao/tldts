import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import pkg from './package.json';


const plugins = [
  resolve({
    module: true,
    jsnext: true,
    main: false,
    preferBuiltins: false,
    modulesOnly: true,
  }),
  cleanup(),
];


export default [
  {
    input: './build/index.js',
    output: {
      file: pkg.main,
      name: pkg.name,
      format: 'umd',
    },
    plugins,
  },
  {
    input: './build/index.js',
    output: {
      file: pkg.module,
      format: 'es',
    },
    plugins,
  },
];
