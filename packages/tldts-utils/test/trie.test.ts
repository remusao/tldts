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

  it("flags the parent of '*' with its rule type", () => {
    expect(flagOf('*.a', ['a'])).to.equal(1);
    expect(flagOf(`${PRIVATE}\n*.a`, ['a'])).to.equal(2);
  });

  it("keeps an exact rule's own rule type", () => {
    expect(flagOf(`*.a\n${PRIVATE}\nb.a`, ['a', 'b'])).to.equal(2);
    expect(flagOf(`a\n${PRIVATE}\n*.a`, ['a'])).to.equal(1);
  });

  it("leaves labels without a '*' sibling or child unflagged", () => {
    expect(flagOf('*.b.a', ['a'])).to.equal(0);
    expect(flagOf('c.b.a', ['a', 'b'])).to.equal(0);
    expect(flagOf('*.a\nd.c.b.a', ['a', 'b', 'c'])).to.equal(0);
  });

  // Unsupported: a node holds one rule type, so its own rule, its exception,
  // `*.x` on itself (`x` implied) and `*.p` on its parent must agree; and an
  // exception `!x` under `*.x` (Chromium lets `*.x` win below `x`). Otherwise a
  // section mask or the exception hides a match. Fails if the PSL adds one.
  it('finds no PSL node with conflicting rules', () => {
    const sections = new Map<string, Set<boolean>>();
    parsePublicSuffixRules(loadPublicSuffixList(), (rule) => {
      const key = (rule.isException ? '!' : '') + rule.rule;
      sections.set(key, (sections.get(key) ?? new Set()).add(rule.isIcann));
    });
    const nodes = new Set<string>();
    for (const rule of sections.keys()) {
      const labels = rule.replace(/^!|^\*\./, '').split('.');
      labels.forEach((_, i) => nodes.add(labels.slice(i).join('.')));
    }
    const conflicts = [...nodes].filter((node) => {
      const parentWildcard = node.includes('.')
        ? `*.${node.slice(node.indexOf('.') + 1)}`
        : '*';
      const types = new Set(
        [node, `!${node}`, `*.${node}`, parentWildcard].flatMap((rule) => [
          ...(sections.get(rule) ?? []),
        ]),
      );
      return (
        types.size > 1 ||
        (sections.has(`!${node}`) && sections.has(`*.${node}`))
      );
    });
    expect(conflicts).to.eql([]);
  });
});
