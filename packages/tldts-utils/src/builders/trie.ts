/**
 * Builds a flat, allocation-free public-suffix trie.
 *
 * The rules are inserted into an in-memory trie, identical sub-trees are shared
 * (DAWG compression), and the result is emitted as a handful of flat typed
 * arrays plus one `text` string holding every edge label:
 *
 *   nodeFlags[node]   -> 0 (none) | 1 (ICANN) | 2 (PRIVATE)
 *   edgeStart[node]   -> first edge index of `node` (edges of a node are a
 *                        contiguous, hash-sorted slice [edgeStart[node], edgeStart[node+1]))
 *   edgeLength[edge]  -> label length
 *   edgeChild[edge]   -> destination node
 *   labelText         -> all edge labels concatenated in edge order
 *
 * The per-edge label offsets (prefix-sum of `edgeLength`) and label hashes
 * (djb2 over `labelText`) are NOT shipped — they are derived once at load in
 * `suffix-trie.ts`. This keeps the bundle small (only compressible text +
 * structure) while the lookup binary-searches integer hashes at runtime.
 *
 * Lookup walks a hostname's labels right-to-left following edges; a flagged
 * node is a public-suffix match. See `suffix-trie.ts`.
 */

import parse from '../parser';

interface ITrie {
  flag: 0 | 1 | 2;
  children: Record<string, ITrie>;
}

/**
 * Insert a public suffix rule (its labels, already reversed) into the `trie`.
 */
function insertInTrie(
  { parts, isIcann }: { parts: string[]; isIcann: boolean },
  trie: ITrie,
): void {
  let node = trie;
  for (const part of parts) {
    let next = node.children[part];
    if (next === undefined) {
      next = { flag: 0, children: {} };
      node.children[part] = next;
    }
    node = next;
  }
  node.flag = isIcann ? 1 : 2;
}

/**
 * djb2 hash over `label`, computed backward. MUST stay identical to the
 * load-time recomputation in `suffix-trie.ts` so edges remain hash-sorted.
 */
function labelHash(label: string): number {
  let hash = 5381;
  for (let i = label.length - 1; i >= 0; i -= 1) {
    hash = (hash * 33) ^ label.charCodeAt(i);
  }
  return hash >>> 0;
}

interface FlatNode {
  flag: 0 | 1 | 2;
  edges: { label: string; child: number }[];
}

/**
 * Flatten the given tries into a shared pool of nodes (identical sub-trees get
 * the same id => DAWG compression). Returns the node pool and each root's id.
 */
function flatten(roots: ITrie[]): { nodes: FlatNode[]; rootIds: number[] } {
  const idByKey = new Map<string, number>();
  const nodes: FlatNode[] = [];

  const visit = (node: ITrie): number => {
    const edges = Object.keys(node.children)
      .sort()
      .map((label) => ({ label, child: visit(node.children[label]!) }));

    // Identity key for DAWG dedup: same flag + same (label -> child) set. Built
    // from the alpha-sorted edges so it is canonical; the stored copy is then
    // re-sorted by hash because the lookup binary-searches edge hashes.
    const key = `${node.flag}|${edges.map((e) => `${e.label}>${e.child}`).join(',')}`;
    let id = idByKey.get(key);
    if (id === undefined) {
      edges.sort((a, b) => labelHash(a.label) - labelHash(b.label));
      id = nodes.length;
      nodes.push({ flag: node.flag, edges });
      idByKey.set(key, id);
    }
    return id;
  };

  return { nodes, rootIds: roots.map(visit) };
}

export default (
  body: string,
  { includePrivate }: { includePrivate: boolean },
): string => {
  const rules: ITrie = { flag: 0, children: {} };
  const exceptions: ITrie = { flag: 0, children: {} };

  parse(body, ({ rule, isIcann, isException }) => {
    if (isIcann || includePrivate) {
      insertInTrie(
        { isIcann, parts: rule.split('.').reverse() },
        isException ? exceptions : rules,
      );
    }
  });

  const { nodes, rootIds } = flatten([rules, exceptions]);

  const nodeFlags: number[] = [];
  const edgeStart: number[] = [0];
  const edgeLength: number[] = [];
  const edgeChild: number[] = [];
  let labelText = '';
  for (const node of nodes) {
    nodeFlags.push(node.flag);
    for (const edge of node.edges) {
      edgeLength.push(edge.label.length);
      edgeChild.push(edge.child);
      labelText += edge.label;
    }
    edgeStart.push(edgeLength.length);
  }

  // The serialized arrays ship as typed arrays (see the emitted code below):
  // edgeChild/edgeStart as Uint16Array, edgeLength as Uint8Array. If the PSL
  // ever outgrows those ranges the values would silently wrap and corrupt every
  // lookup, so fail the build loudly instead. Headroom is large today (~600
  // nodes / ~10k edges / max label 31 vs the 65535/255 ceilings). If this trips,
  // widen the array(s) here AND in the two suffix-trie.ts loaders.
  let maxEdgeLength = 0;
  for (const length of edgeLength) {
    if (length > maxEdgeLength) {
      maxEdgeLength = length;
    }
  }
  if (nodes.length > 65536) {
    // edgeChild stores node ids in [0, nodes.length); max id must fit Uint16.
    throw new Error(
      `trie builder: ${nodes.length} nodes exceeds the Uint16 edgeChild range (max 65536). Widen edgeChild + edgeStart to Uint32Array here and in suffix-trie.ts.`,
    );
  }
  if (edgeLength.length > 65535) {
    // edgeStart stores edge indices up to the edge count; must fit Uint16.
    throw new Error(
      `trie builder: ${edgeLength.length} edges exceeds the Uint16 edgeStart range (max 65535). Widen edgeStart + edgeChild to Uint32Array here and in suffix-trie.ts.`,
    );
  }
  if (maxEdgeLength > 255) {
    throw new Error(
      `trie builder: label length ${maxEdgeLength} exceeds the Uint8 edgeLength range (max 255). Widen edgeLength to Uint16Array here and in suffix-trie.ts.`,
    );
  }

  return `// Auto-generated flat public-suffix trie. Do not edit.
export const nodeFlags = /*#__PURE__*/ new Uint8Array([${nodeFlags.join(',')}]);
export const edgeStart = /*#__PURE__*/ new Uint16Array([${edgeStart.join(',')}]);
export const edgeLength = /*#__PURE__*/ new Uint8Array([${edgeLength.join(',')}]);
export const edgeChild = /*#__PURE__*/ new Uint16Array([${edgeChild.join(',')}]);
export const labelText = ${JSON.stringify(labelText)};
export const rulesRoot = ${rootIds[0]};
export const exceptionsRoot = ${rootIds[1]};
`;
};
