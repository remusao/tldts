import {
  fastPathLookup,
  IPublicSuffix,
  ISuffixLookupOptions,
} from 'tldts-core';
import { exceptions, ITrie, rules } from './data/trie';

interface IMatch {
  index: number;
}

/**
 * Lookup parts of domain in Trie
 */
function lookupInTrie(
  parts: string[],
  trie: ITrie,
  index: number,
): IMatch | null {
  let result: IMatch | null = null;
  let node: ITrie | undefined = trie;
  while (node !== undefined) {
    // We have a match!
    if (node[0] === 1) {
      result = {
        index: index + 1,
      };
    }

    // No more `parts` to look for
    if (index === -1) {
      break;
    }

    const succ: { [label: string]: ITrie } = node[1];
    node = Object.prototype.hasOwnProperty.call(succ, parts[index]!)
      ? succ[parts[index]!]
      : succ['*'];
    index -= 1;
  }

  return result;
}

/**
 * Check if `hostname` has a valid public suffix in `trie`.
 */
export default function suffixLookup(
  hostname: string,
  options: ISuffixLookupOptions,
  out: IPublicSuffix,
): void {
  if (fastPathLookup(hostname, options, out)) {
    return;
  }

  const hostnameParts = hostname.split('.');

  // Look for exceptions
  const exceptionMatch = lookupInTrie(
    hostnameParts,
    exceptions,
    hostnameParts.length - 1,
  );

  if (exceptionMatch !== null) {
    out.publicSuffix = hostnameParts.slice(exceptionMatch.index + 1).join('.');
    return;
  }

  // Look for a match in rules
  const rulesMatch = lookupInTrie(
    hostnameParts,
    rules,
    hostnameParts.length - 1,
  );

  if (rulesMatch !== null) {
    out.publicSuffix = hostnameParts.slice(rulesMatch.index).join('.');
    return;
  }

  // No match found...
  // Prevailing rule is '*' so we consider the top-level domain to be the
  // public suffix of `hostname` (e.g.: 'example.org' => 'org').
  out.publicSuffix = hostnameParts[hostnameParts.length - 1] ?? null;
}
