import resolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps2';

export default {
  input: './dist/es6/index.js',
  output: {
    file: './dist/cjs/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [resolve(), sourcemaps()],
};
