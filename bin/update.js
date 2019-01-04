#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildTrie = require('./builders/trie.js');
const buildHashes = require('./builders/hashes.js');

(function run() {
  console.log('Updating rules...');
  const publicSuffixList = fs.readFileSync(
    path.resolve(__dirname, '../publicsuffix/public_suffix_list.dat'),
    { encoding: 'utf-8' },
  );

  // Build trie and update TypeScript file
  fs.writeFileSync(
    path.resolve(__dirname, '../lib/lookup/data/trie.ts'),
    buildTrie(publicSuffixList),
    'utf-8',
  );

  // Build hashes and update TypeScript file
  const packed = buildHashes(publicSuffixList);
  fs.writeFileSync(
    path.resolve(__dirname, '../lib/lookup/data/hashes.ts'),
    `// Code automatically generated using ./bin/builders/hashes.js
export default new Uint32Array([${[...packed]}]);`,
    'utf-8',
  );
}());
