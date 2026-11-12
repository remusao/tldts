import { expect } from 'chai';
import 'mocha';

import { runInNewContext } from 'node:vm';

import { loadPublicSuffixList, parsePublicSuffixRules } from '..';
import buildTrie from '../src/builders/trie';

/**
 * Build a trie from `body` and return the flag of the rule-trie node reached
 * by `labels` (TLD first).
 */
function flagOf(body: string, labels: string[]): number {
  const trie = {} as {
    nodeFlags: Uint8Array;
    edgeStart: Uint16Array;
    edgeLength: Uint8Array;
    edgeChild: Uint16Array;
    labelText: string;
    rulesRoot: number;
  };
  runInNewContext(
    buildTrie(body, { includePrivate: true }).replace(
      /^export const /gm,
      'exports.',
    ),
    { exports: trie },
  );

  const offsets = [0];
  for (const length of trie.edgeLength) {
    offsets.push(offsets[offsets.length - 1]! + length);
  }

  let node = trie.rulesRoot;
  for (const label of labels) {
    const end = trie.edgeStart[node + 1]!;
    let edge = trie.edgeStart[node]!;
    while (
      edge < end &&
      trie.labelText.slice(offsets[edge], offsets[edge + 1]) !== label
    ) {
      edge += 1;
    }
    if (edge === end) {
      throw new Error(`no edge: ${label}`);
    }
    node = trie.edgeChild[edge]!;
  }
  return trie.nodeFlags[node]!;
}

describe('#buildTrie', () => {
  const PRIVATE = '// ===BEGIN PRIVATE DOMAINS===';

  it("flags an exact label with its '*' sibling's rule type", () => {
    expect(flagOf(`*.a\n${PRIVATE}\n*.b.a`, ['a', 'b'])).to.equal(1);
    expect(flagOf(`${PRIVATE}\n*.a\n*.b.a`, ['a', 'b'])).to.equal(2);
  });

  it("keeps an exact rule's own rule type", () => {
    expect(flagOf(`*.a\n${PRIVATE}\nb.a`, ['a', 'b'])).to.equal(2);
  });

  it("leaves labels without a '*' sibling unflagged", () => {
    expect(flagOf('*.a\n*.b.a', ['a'])).to.equal(0);
    expect(flagOf('c.b.a', ['a', 'b'])).to.equal(0);
    expect(flagOf('*.a\nd.c.b.a', ['a', 'b', 'c'])).to.equal(0);
  });

  // Unsupported: exact rule `x.p` beside `*.p` of the other section (the exact
  // edge hides `*.p` when the exact rule's section is disabled). Fails if the
  // PSL ever adds one.
  it("finds no PSL rule beside a '*' rule of the other section", () => {
    const isIcann = new Map<string, boolean>();
    parsePublicSuffixRules(loadPublicSuffixList(), (rule) => {
      if (!rule.isException) {
        isIcann.set(rule.rule, rule.isIcann);
      }
    });
    const conflicts = [...isIcann.keys()].filter((rule) => {
      const wildcard = rule.replace(/^[^.]+/, '*');
      return (
        wildcard !== rule &&
        isIcann.has(wildcard) &&
        isIcann.get(wildcard) !== isIcann.get(rule)
      );
    });
    expect(conflicts).to.eql([]);
  });
});
