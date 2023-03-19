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

import parse from '../parser';

interface ITrie {
  $: 0 | 1 | 2;
  succ: { [label: string]: ITrie };
}

/**
 * Insert a public suffix rule in the `trie`.
 */
function insertInTrie(
  {
    parts,
    isIcann,
  }: {
    parts: string[];
    isIcann: boolean;
  },
  trie: ITrie,
): ITrie {
  let node: ITrie = trie;

  for (const part of parts) {
    let nextNode = node.succ[part];
    if (nextNode === undefined) {
      nextNode = { $: 0, succ: {} };
      node.succ[part] = nextNode;
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
function compressToDAWG(trie: ITrie, name: string): string {
  const nodesByHash = new Map<string, ITrie[]>();
  const replaceNodes = new Map<ITrie, (newNode: ITrie) => void>();

  (function groupNodesByHash(node: ITrie): string {
    // Get a sorted list of next labels from this node
    const nexts = Object.entries(node.succ)
      .filter(([n]) => n !== '$')
      .sort();

    // Create a setter which can be used later to replace the value of a node.
    // Each node is associated with a lambda function accepting one argument:
    // the new value of the node. Because the context of the node (parent and
    // label) is captured in the closure, it allows to just call it later, in a
    // different context, to change the value of a given node in-place.
    nexts.forEach(([n, succ]) => {
      replaceNodes.set(succ, (newNode: ITrie) => {
        node.succ[n] = newNode;
      });
    });

    // Compute a unique hash for this node recursively.
    const hash = `(${node.$},${[
      ...nexts.map(([c, succ]) => `${c},${groupNodesByHash(succ)}`),
    ].join('|')})`;

    // Keep track of all node's hashes
    let nodes: undefined | ITrie[] = nodesByHash.get(hash);
    if (nodes === undefined) {
      nodes = [];
      nodesByHash.set(hash, nodes);
    }
    nodes.push(node);

    return hash;
  })(trie);

  // Given `nodesByHash`, which associates a list of nodes to each hash
  // encountered in the previous step, we will detect all the sub-trees being
  // seen more than once and store them in a variable to allow sharing with
  // different parts in the DAWG.
  const variables: string[] = [];
  nodesByHash.forEach((nodes) => {
    if (nodes.length > 1) {
      // Dump one of the nodes (they are all the same so it does not matter which one)
      variables.push(`_${nextId}: ITrie = ${JSON.stringify(nodes[0])}`);

      // Replace all the other ones by the name of this new variable
      nodes.forEach((node) => {
        // @ts-expect-error
        replaceNodes.get(node)?.(`_${nextId}`);
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
  output.push(`const ${name}: ITrie = ${serializedTrie};`);

  return output.join('\n');
}

function convertToTypeScriptSource(rules: ITrie, exceptions: ITrie): string {
  return `
export interface ITrie {
  $: 0 | 1 | 2;
  succ: { [label: string]: ITrie };
}

export const exceptions: ITrie = (function() {
  ${compressToDAWG(exceptions, 'exceptions')}
  return exceptions;
})();

export const rules: ITrie = (function() {
  ${compressToDAWG(rules, 'rules')}
  return rules;
})();
`;
}

export default (body: string) => {
  const exceptions: ITrie = { $: 0, succ: {} };
  const rules: ITrie = { $: 0, succ: {} };

  // Iterate on public suffix rules
  parse(body, ({ rule, isIcann, isException }) => {
    insertInTrie(
      { isIcann, parts: rule.split('.').reverse() },
      isException ? exceptions : rules,
    );
  });

  return convertToTypeScriptSource(rules, exceptions);
};
