#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

(function run() {
  console.log('Updating rules...');
  const publicSuffixList = fs.readFileSync(
    path.resolve(__dirname, '../publicsuffix/public_suffix_list.dat'),
    { encoding: 'utf-8' },
  );
  const tsCode = `
import parse from './parsers/publicsuffix-org';

export default function getRules() {
  return parse(\`
${publicSuffixList}
  \`);
}
  `;
  fs.writeFileSync(path.resolve(__dirname, '../lib/rules.ts'), tsCode, 'utf-8');
})();
