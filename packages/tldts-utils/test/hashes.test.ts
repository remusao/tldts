import { expect } from 'chai';
import 'mocha';

import { loadPublicSuffixList, parsePublicSuffixRules } from '..';
import { fastHash } from '../src/builders/hashes';

describe('#buildHashes', () => {
  // Lookups check every section at a given label count, so two distinct
  // names sharing a hash there (e.g. an exception and a rule) are confused.
  it('finds no hash shared by distinct PSL names with the same label count', () => {
    const names = new Map<string, string>();
    const collisions: string[] = [];
    parsePublicSuffixRules(loadPublicSuffixList(), ({ rule, isWildcard }) => {
      const name = isWildcard ? rule.slice(2) : rule;
      const key = `${name.split('.').length}:${fastHash(name)}`;
      const other = names.get(key);
      if (other !== undefined && other !== name) {
        collisions.push(`${other} ${name}`);
      }
      names.set(key, name);
    });
    expect(collisions).to.eql([]);
  });
});
