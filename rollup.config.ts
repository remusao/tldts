import compiler from '@ampproject/rollup-plugin-closure-compiler';

function tasks(bundleName) {
  return [
    // UMD
    {
      input: `./build/${bundleName}.js`,
      output: {
        file: `./dist/${bundleName}.umd.js`,
        format: 'umd',
        name: 'tldts',
      },
    },
    // UMD minified
    {
      input: `./build/${bundleName}.js`,
      output: {
        file: `./dist/${bundleName}.umd.min.js`,
        format: 'umd',
        name: 'tldts',
      },
      plugins: [compiler()],
    },
    // CommonJS + ES6
    {
      input: `./build/${bundleName}.js`,
      output: [
        { file: `./dist/${bundleName}.esm.js`, format: 'es' },
        { file: `./dist/${bundleName}.cjs.js`, format: 'cjs' },
      ],
    },
    // ES6 minified
    {
      input: `./build/${bundleName}.js`,
      output: {
        file: `./dist/${bundleName}.esm.min.js`,
        format: 'es',
      },
      plugins: [compiler()],
    },
    // CommonJS minified
    {
      input: `./dist/${bundleName}.esm.min.js`,
      output: {
        file: `./dist/${bundleName}.cjs.min.js`,
        format: 'cjs',
      },
    },
  ];
}

export default [...tasks('tldts-experimental'), ...tasks('tldts')];
