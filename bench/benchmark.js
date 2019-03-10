#!/usr/bin/env node

const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const tldtsExperimental = require(path.resolve(
  __dirname,
  '../dist/tldts-experimental.umd.min.js',
));
const tldtsDefault = require(path.resolve(
  __dirname,
  '../dist/tldts.umd.min.js',
));

function bench(title, tldts, inputs) {
  console.log(`* Start: ${title}`);
  const t0 = Date.now();
  for (let i = 0; i < inputs.length; i += 1) {
    tldts.parse(inputs[i]);
    tldts.parse(inputs[i]);
    tldts.parse(inputs[i]);
    tldts.parse(inputs[i]);
    tldts.parse(inputs[i]);
  }
  const total = Date.now() - t0;
  console.log(`  - ${total / 5} ms`);
  console.log(`  - ${total / inputs.length / 5} ms per input`);
  console.log(
    `  - ${Math.floor(1000 / (total / inputs.length / 5))} calls per second`,
  );
}

function main() {
  const urls = [
    ...new Set(
      fs
        .readFileSync(path.resolve(__dirname, './requests.json'), {
          encoding: 'utf-8',
        })
        .split(/[\n\r]+/g)
        .map(JSON.parse)
        .map(({ url }) => url),
    ),
  ];
  console.log('urls', urls.length);

  const hostnames = [...new Set(urls.map(url => new URL(url).hostname))];
  console.log('Hosts', hostnames.length);

  bench('tldts URLs', tldtsDefault, urls);
  bench('tldts-experimental URLs', tldtsExperimental, urls);
  bench('tldts hostnames', tldtsDefault, hostnames);
  bench('tldts-experimental hostnames', tldtsExperimental, hostnames);
}

main();
