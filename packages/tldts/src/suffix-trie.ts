import {
  fastPathLookup,
  IPublicSuffix,
  ISuffixLookupOptions,
} from 'tldts-core';
import { exceptions, ITrie, rules } from './data/trie';

// Flags used to know if a rule is ICANN or Private
const enum RULE_TYPE {
  ICANN = 1,
  PRIVATE = 2,
}

interface IMatch {
  index: number;
  isIcann: boolean;
  isPrivate: boolean;
}

// Reused across calls so that a matching trie node does not allocate a result
// object every time (there can be several matches while walking a single
// hostname). Safe because lookups are synchronous and the returned match is
// consumed before the next lookup runs.
const MATCH: IMatch = { index: 0, isIcann: false, isPrivate: false };

/**
 * Lookup parts of domain in Trie
 */
function lookupInTrie(
  parts: string[],
  trie: ITrie,
  index: number,
  allowedMask: number,
): IMatch | null {
  let result: IMatch | null = null;
  let node: ITrie | undefined = trie;
  while (node !== undefined) {
    // We have a match!
    if ((node[0] & allowedMask) !== 0) {
      MATCH.index = index + 1;
      MATCH.isIcann = (node[0] & RULE_TYPE.ICANN) !== 0;
      MATCH.isPrivate = (node[0] & RULE_TYPE.PRIVATE) !== 0;
      result = MATCH;
    }

    // No more `parts` to look for
    if (index === -1) {
      break;
    }

    const succ: Record<string, ITrie> = node[1];
    node = Object.prototype.hasOwnProperty.call(succ, parts[index]!)
      ? succ[parts[index]!]
      : succ['*'];
    index -= 1;
  }

  return result;
}

/**
 * Index in `hostname` where the public suffix starting at label `p` (in the
 * forward `parts` split) begins. Equivalent to `parts.slice(p).join('.')` but
 * returns an offset so we can produce the suffix with a single `hostname.slice`
 * instead of allocating an intermediate array + joined string.
 */
function suffixOffset(hostname: string, parts: string[], p: number): number {
  let length = 0;
  for (let i = p; i < parts.length; i += 1) {
    length += parts[i]!.length + 1;
  }
  return hostname.length - length + 1;
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

  const allowedMask =
    (options.allowPrivateDomains ? RULE_TYPE.PRIVATE : 0) |
    (options.allowIcannDomains ? RULE_TYPE.ICANN : 0);

  // Look for exceptions
  const exceptionMatch = lookupInTrie(
    hostnameParts,
    exceptions,
    hostnameParts.length - 1,
    allowedMask,
  );

  if (exceptionMatch !== null) {
    out.isIcann = exceptionMatch.isIcann;
    out.isPrivate = exceptionMatch.isPrivate;
    out.publicSuffix = hostname.slice(
      suffixOffset(hostname, hostnameParts, exceptionMatch.index + 1),
    );
    return;
  }

  // Look for a match in rules
  const rulesMatch = lookupInTrie(
    hostnameParts,
    rules,
    hostnameParts.length - 1,
    allowedMask,
  );

  if (rulesMatch !== null) {
    out.isIcann = rulesMatch.isIcann;
    out.isPrivate = rulesMatch.isPrivate;
    out.publicSuffix = hostname.slice(
      suffixOffset(hostname, hostnameParts, rulesMatch.index),
    );
    return;
  }

  // No match found...
  // Prevailing rule is '*' so we consider the top-level domain to be the
  // public suffix of `hostname` (e.g.: 'example.org' => 'org').
  out.isIcann = false;
  out.isPrivate = false;
  out.publicSuffix = hostnameParts[hostnameParts.length - 1] ?? null;
}
