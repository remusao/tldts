#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const punycode = require('punycode');

/**
 * Insert a public suffix rule in the `trie`.
 */
function insertInTrie({ parts, isIcann }, trie) {
  let node = trie;

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    let nextNode = node[part];
    if (nextNode === undefined) {
      nextNode = Object.create(null);
      node[part] = nextNode;
    }

    node = nextNode;
  }

  node.$ = isIcann ? 1 : 2;

  return trie;
}


/**
 * Parse a one-domain-per-line file
 */
function createTrie(body) {
  const exceptions = {};
  const rules = {};

  const beginPrivateDomains = '// ===BEGIN PRIVATE DOMAINS===';
  const lines = body.split('\n');

  let isIcann = true;

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i].trim();

    // Ignore empty lines
    if (line.length === 0) { continue; }

    // Comment (check for beginning of Private domains section)
    if (line.startsWith('//')) {
      if (line.startsWith(beginPrivateDomains)) {
        isIcann = false;
      }

      continue;
    }

    // TODO - Ignore leading or trailing dot

    // Only read line up to the first white-space
    const spaceIndex = line.indexOf(' ');
    if (spaceIndex !== -1) {
      line = line.substr(0, spaceIndex);
    }

    // Check if the rule is an exception
    let exception = false;
    if (line[0] === '!') {
      line = line.substr(1);
      exception = true;
    }

    const parts = line.split('.').reverse();

    // Encode all labels to ASCII using punycode
    for (let j = 0; j < parts.length; j += 1) {
      parts[j] = punycode.toASCII(parts[j]);
    }

    if (exception) {
      insertInTrie({ isIcann, parts }, exceptions);
    } else {
      insertInTrie({ isIcann, parts }, rules);
    }
  }

  return { rules, exceptions };
}

(function run() {
  console.log('Updating rules...');
  const publicSuffixList = fs.readFileSync(
    path.resolve(__dirname, '../publicsuffix/public_suffix_list.dat'),
    { encoding: 'utf-8' },
  );
  const { rules, exceptions } = createTrie(publicSuffixList);
  const tsCode = `
export const rules: any = ${JSON.stringify(rules)};
export const exceptions: any = ${JSON.stringify(exceptions)};
  `;
  fs.writeFileSync(path.resolve(__dirname, '../lib/rules.ts'), tsCode, 'utf-8');
}());
