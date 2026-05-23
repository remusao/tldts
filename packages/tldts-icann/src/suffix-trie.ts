// NOTE: kept (intentionally) near-identical to packages/tldts/src/suffix-trie.ts.
// They are separate copies rather than a shared helper because the lookup is
// only fast when the typed arrays are module-scope monomorphic globals —
// closing over them (a shared factory) measured ~20% slower. This ICANN build
// specializes: every terminal node is an ICANN rule, so the mask is constant
// and isIcann/isPrivate are never written. Keep the two in sync.
import {
  fastPathLookup,
  IPublicSuffix,
  ISuffixLookupOptions,
} from 'tldts-core';
import {
  edgeChild,
  edgeLength,
  edgeStart,
  exceptionsRoot,
  labelText,
  nodeFlags,
  rulesRoot,
} from './data/trie';

const ICANN = 1;

// `edgeOffset` (where each label starts in `labelText`), `edgeHash` (djb2 of
// each label) and `wildcardEdge` (each node's '*' edge, or -1) are derived once
// at load instead of being shipped: the bundle then carries only the
// compressible `labelText` + structure, while the lookup binary-searches
// integer hashes. Kept at module scope (not captured in a closure) so V8 treats
// the typed arrays as fast monomorphic globals.
const numberOfNodes = nodeFlags.length;
const numberOfEdges = edgeLength.length;
const edgeOffset = new Uint32Array(numberOfEdges);
const edgeHash = new Uint32Array(numberOfEdges);
const wildcardEdge = new Int32Array(numberOfNodes).fill(-1);
for (let node = 0, offset = 0; node < numberOfNodes; node += 1) {
  for (let edge = edgeStart[node]!; edge < edgeStart[node + 1]!; edge += 1) {
    edgeOffset[edge] = offset;
    const end = offset + edgeLength[edge]!;
    let hash = 5381;
    for (let i = end - 1; i >= offset; i -= 1) {
      hash = (hash * 33) ^ labelText.charCodeAt(i);
    }
    edgeHash[edge] = hash >>> 0;
    if (
      edgeLength[edge] === 1 &&
      labelText.charCodeAt(offset) === 42 /* '*' */
    ) {
      wildcardEdge[node] = edge;
    }
    offset = end;
  }
}

// Result of the last `walk`, kept in module scope to avoid allocating a match
// object. Safe because lookups are synchronous and read right after `walk`.
let matchStart = 0;
let matchEnd = 0;
let matched = false;

/**
 * True if edge `edge`'s label equals `hostname[start, start + length)`.
 */
function labelEquals(
  edge: number,
  hostname: string,
  start: number,
  length: number,
): boolean {
  if (edgeLength[edge] !== length) {
    return false;
  }
  const offset = edgeOffset[edge]!;
  for (let i = 0; i < length; i += 1) {
    if (labelText.charCodeAt(offset + i) !== hostname.charCodeAt(start + i)) {
      return false;
    }
  }
  return true;
}

/**
 * Find the child edge of `node` whose label is `hostname[start, start + length)`.
 * Edges are sorted by hash, so binary-search the hash then verify the label
 * (scanning the rare run of equal hashes). Returns the edge index or -1.
 */
function findEdge(
  node: number,
  hash: number,
  hostname: string,
  start: number,
  length: number,
): number {
  let lo = edgeStart[node]!;
  let hi = edgeStart[node + 1]!;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    const value = edgeHash[mid]!;
    if (value < hash) {
      lo = mid + 1;
    } else if (value > hash) {
      hi = mid;
    } else {
      for (let e = mid; e >= lo && edgeHash[e] === hash; e -= 1) {
        if (labelEquals(e, hostname, start, length)) return e;
      }
      for (let e = mid + 1; e < hi && edgeHash[e] === hash; e += 1) {
        if (labelEquals(e, hostname, start, length)) return e;
      }
      return -1;
    }
  }
  return -1;
}

/**
 * Walk `hostname`'s labels right-to-left from `root`, recording the deepest
 * ICANN node (with the label boundaries of that match in
 * `matchStart`/`matchEnd`). Returns whether any match was found.
 */
function walk(hostname: string, root: number): boolean {
  let node = root;
  let end = hostname.length;
  let hash = 5381;
  matched = false;
  for (let i = hostname.length - 1; i >= 0; i -= 1) {
    const code = hostname.charCodeAt(i);
    if (code === 46 /* '.' */) {
      const start = i + 1;
      let edge = findEdge(node, hash >>> 0, hostname, start, end - start);
      if (edge === -1) {
        edge = wildcardEdge[node]!;
      }
      if (edge === -1) {
        return matched;
      }
      node = edgeChild[edge]!;
      if ((nodeFlags[node]! & ICANN) !== 0) {
        matched = true;
        matchStart = start;
        matchEnd = end;
      }
      end = i;
      hash = 5381;
    } else {
      hash = (hash * 33) ^ code;
    }
  }

  // Left-most label: hostname[0, end). Same find/descend/record as the loop —
  // duplicated rather than folded into the loop (via `i >= -1`) because that
  // extra per-character branch measured slightly slower on the hot path.
  let edge = findEdge(node, hash >>> 0, hostname, 0, end);
  if (edge === -1) {
    edge = wildcardEdge[node]!;
  }
  if (edge !== -1) {
    node = edgeChild[edge]!;
    if ((nodeFlags[node]! & ICANN) !== 0) {
      matched = true;
      matchStart = 0;
      matchEnd = end;
    }
  }
  return matched;
}

/**
 * Check if `hostname` has a valid public suffix in the trie.
 */
export default function suffixLookup(
  hostname: string,
  options: ISuffixLookupOptions,
  out: IPublicSuffix,
): void {
  if (fastPathLookup(hostname, options, out)) {
    return;
  }

  // Exceptions have priority and strip their own left-most label (e.g. the
  // rule '!www.ck' makes the suffix of 'www.ck' be 'ck').
  if (walk(hostname, exceptionsRoot)) {
    out.publicSuffix = hostname.slice(matchEnd + 1);
    return;
  }

  if (walk(hostname, rulesRoot)) {
    out.publicSuffix = hostname.slice(matchStart);
    return;
  }

  // No match: the prevailing '*' rule makes the right-most label the suffix.
  const lastDot = hostname.lastIndexOf('.');
  out.publicSuffix = lastDot === -1 ? hostname : hostname.slice(lastDot + 1);
}
