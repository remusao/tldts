/**
 * This builder implements a fast and compact DAWG data-structure (a.k.a.:
 * direct acyclic word graph, with suffix and prefix compression of the
 * top-level domains) using JavaScript Objects. It is a good trade-off between
 * correctness, speed and space. This is much faster then using a linear scan
 * over all the rules, but slightly slower than the probabilistic
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
      nextNode = {};
      node[part] = nextNode;
    }

    node = nextNode;
  }

  node.$ = isIcann ? 1 : 2;

  return trie;
}

let nextId = 0;

/**
 * Compress the given `trie` into a DAWG (by compressing common suffixes as
 * well as prefixes). This form is very efficient but cannot be dumped as a
 * simple JSON into the file. The solution is to create intermediary variables
 * for each shared sub-tree, which are then used in the main DAWG.
 */
function compressToDAWG(trie, name) {
  const nodesByHash = new Map();
  const replaceNodes = new Map();

  (function groupNodesByHash(node) {
    // Get a sorted list of next labels from this node
    const nexts = Object.keys(node)
      .filter(n => n !== '$')
      .sort();

    // Create a setter which can be used later to replace the value of a node.
    // Each node is associated with a lambda function accepting one argument:
    // the new value of the node. Because the context of the node (parent and
    // label) is captured in the closure, it allows to just call it later, in a
    // different context, to change the value of a given node in-place.
    nexts.forEach((n) => {
      replaceNodes.set(
        node[n],
        (newNode) => {
          // eslint-disable-next-line no-param-reassign
          node[n] = newNode;
        },
      );
    });

    // Compute a unique hash for this node recursively.
    const hash = `(${node.$},${[
      ...nexts.map(c => `${c},${groupNodesByHash(node[c])}`),
    ].join('|')})`;

    // Keep track of all node's hashes
    if (!nodesByHash.has(hash)) {
      nodesByHash.set(hash, []);
    }
    nodesByHash.get(hash).push(node);

    return hash;
  }(trie));

  // Given `nodesByHash`, which associates a list of nodes to each hash
  // encountered in the previous step, we will detect all the sub-trees being
  // seen more than once and store them in a variable to allow sharing with
  // different parts in the DAWG.
  const variables = [];
  nodesByHash.forEach((nodes) => {
    if (nodes.length > 1) {
      // Dump one of the nodes (they are all the same so it does not matter which one)
      variables.push(`_${nextId}=${JSON.stringify(nodes[0])}`);

      // Replace all the other ones by the name of this new variable
      nodes.forEach((node) => {
        replaceNodes.get(node)(`_${nextId}`);
      });

      nextId += 1;
    }
  });

  const output = [];

  // Create TypeScript source code to declare all of these variables. Because
  // the value of nodes has been set to a value of the form '"_id"', we need to
  // replace this on the fly to '_id'. We use a RegExp for this.
  if (variables.length !== 0) {
    let variablesSourceCode = `const ${variables.join(',')};`;
    for (let i = 0; i < nextId; i += 1) {
      variablesSourceCode = variablesSourceCode.replace(
        new RegExp(`"_${i}"`, 'g'),
        `_${i}`,
      );
    }
    output.push(variablesSourceCode);
  }

  // Dump the root of the DAWG as well, and perform the same replacement of _id
  // parts than for the variables above.
  let serializedTrie = JSON.stringify(trie);
  for (let i = 0; i < nextId; i += 1) {
    serializedTrie = serializedTrie.replace(
      new RegExp(`"_${i}"`, 'g'),
      `_${i}`,
    );
  }
  output.push(`export const ${name} = ${serializedTrie};`);

  return output.join('\n');
}

function convertToTypeScriptSource(rules, exceptions) {
  return `${compressToDAWG(exceptions, 'exceptions')}\n${compressToDAWG(
    rules,
    'rules',
  )}`;
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

  return convertToTypeScriptSource(rules, exceptions);
};
