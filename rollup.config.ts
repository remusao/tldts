import compiler from '@ampproject/rollup-plugin-closure-compiler';

function tasks(bundleName) {
  return [
    // ES6 + CommonJS + UMD minified
    {
      input: `./build/es6/${bundleName}.js`,
      output: [
        {
          file: `./dist/${bundleName}.umd.min.js`,
          format: 'umd',
          name: 'tldts',
        },
        {
          file: `./dist/${bundleName}.esm.min.js`,
          format: 'es',
        },
        {
          file: `./dist/${bundleName}.cjs.min.js`,
          format: 'cjs',
        },
      ],
      plugins: [compiler()],
    },
  ];
}

export default [...tasks('tldts-experimental'), ...tasks('tldts')];
