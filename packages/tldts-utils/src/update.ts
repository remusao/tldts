import { writeFileSync } from 'fs';

import findBaseDir from './find-base-dir';
import loadPublicSuffixList from './list';
import buildHashes from './builders/hashes';
import buildTrie from './builders/trie';

export default function () {
  console.log('Updating rules...');
  const publicSuffixList = loadPublicSuffixList();

  // Build trie and update TypeScript file
  writeFileSync(
    findBaseDir('./tldts/src/data/trie.ts'),
    buildTrie(publicSuffixList),
    'utf-8',
  );

  // Build hashes and update TypeScript file
  const packed = buildHashes(publicSuffixList);
  writeFileSync(
    findBaseDir('./tldts-experimental/src/data/hashes.ts'),
    `
// Code automatically generated using ./bin/builders/hashes.ts
export default new Uint32Array([${Array.from(packed).toString()}]);
`,
    'utf-8',
  );
}
