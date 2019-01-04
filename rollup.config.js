import pkg from './package.json';

export default [
  {
    input: './build/tldts-experimental.js',
    output: {
      file: pkg.browser.replace('tldts', 'tldts-experimental'),
      name: pkg.name,
      format: 'umd',
    },
  },
  {
    input: './build/tldts-experimental.js',
    output: [
      { file: pkg.module.replace('tldts', 'tldts-experimental'), format: 'es' },
      { file: pkg.main.replace('tldts', 'tldts-experimental'), format: 'cjs' },
    ],
  },
  {
    input: './build/tldts.js',
    output: {
      file: pkg.browser,
      name: pkg.name,
      format: 'umd',
    },
  },
  {
    input: './build/tldts.js',
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs' },
    ],
  },
];
