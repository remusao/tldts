/**
 * This builder implements a pretty fast Trie data-structure (suffix compression
 * of the top-level domains) using JavaScript Objects. It is a good trade-off
 * between correctness, speed and space. This is much faster then using a linear
 * scan over all the rules, but slightly slower than the probabilistic
 * data-structure implemented in `bin/builders/hashes.js`.
 *
 * Here is a simple example:
 *
 *   co.uk
 *   gov.uk
 *   fr
 *
 *  <root>
 *    |_ uk
 *       |_ co *
 *       |_ gov *
 *    |_ fr *
 *
 *  Finding a match is then a matter of iterating on labels of a hostname
 *  backward and following the branches of the Trie. Whenever we find a terminal
 *  node (indicated with a '*' above), we consider this a match.
 */

const parse = require('../parser');

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

module.exports = (body) => {
  const exceptions = {};
  const rules = {};

  // Iterate on public suffix rules
  parse(body, ({ rule, isIcann, isException }) => {
    insertInTrie(
      { isIcann, parts: rule.split('.').reverse() },
      isException ? exceptions : rules,
    );
  });

  return { rules, exceptions };
};
