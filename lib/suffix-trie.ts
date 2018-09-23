import * as punycode from 'punycode';
import { startsWith } from './polyfill';

interface IOptions {
  allowIcannDomains: boolean;
  allowPrivateDomains: boolean;
}

export interface IPublicSuffix {
  isIcann: boolean;
  isPrivate: boolean;
  publicSuffix: string | null;
}

// Flags used to know if a rule is ICANN or Private
const enum RULE_TYPE {
  ICANN = 1,
  PRIVATE = 2,
}

export interface IRule {
  exception: boolean;
  isIcann: boolean;
  parts: string[];
  source: string;
}

interface IMatch {
  index: number;
  isIcann: boolean;
}

interface ITrieObject {
  [s: string]: ITrieObject;
}

/**
 * Return the lookup object having the longest match, ignoring possible `-1` values.
 */
function longestMatch(a: IMatch, b: IMatch): IMatch {
  if (a.index === -1) {
    return b;
  } else if (b.index === -1) {
    return a;
  } else if (a.index < b.index) {
    return a;
  }

  return b;
}

/**
 * Insert a public suffix rule in the `trie`.
 * TODO - transform into an array of nodes with static indices
 */
function insertInTrie(rule: IRule, trie: any): any {
  const parts = rule.parts;
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

  node.$ = rule.isIcann ? RULE_TYPE.ICANN : RULE_TYPE.PRIVATE;

  return trie;
}

/**
 * Recursive lookup of `parts` (starting at `index`) in the tree.
 * TODO - make iterative using a fixed-size simulated stack for intermediary
 * results?
 */
function lookupInTrie(parts: string[], trie: any, index: number, allowedMask: number): IMatch {
  let nextNode;
  let lookupResult = {
    index: -1,
    isIcann: false,
  };

  // We have a match!
  if (trie.$ !== undefined && (trie.$ & allowedMask) !== 0) {
    lookupResult.index = index + 1;
    lookupResult.isIcann = trie.$ === RULE_TYPE.ICANN;
  }

  // No more `parts` to look for
  if (index === -1) {
    return lookupResult;
  }

  // Check branch corresponding to next part of hostname
  nextNode = trie[parts[index]];
  if (nextNode !== undefined) {
    lookupResult = longestMatch(
      lookupResult,
      lookupInTrie(parts, nextNode, index - 1, allowedMask),
    );
  }

  // Check wildcard branch
  nextNode = trie['*'];
  if (nextNode !== undefined) {
    lookupResult = longestMatch(
      lookupResult,
      lookupInTrie(parts, nextNode, index - 1, allowedMask),
    );
  }

  return lookupResult;
}

function hasPunycode(parts: string[]): boolean {
  for (let i = 0; i < parts.length; i += 1) {
    if (startsWith(parts[i], 'xn--')) {
      return true;
    }
  }
  return false;
}

function decodePunycodeLabels(parts: string[]): string[] {
  const decoded = parts.slice();
  for (let i = 0; i < parts.length; i += 1) {
    if (startsWith(parts[i], 'xn--')) {
      decoded[i] = punycode.toUnicode(parts[i]);
    }
  }
  return decoded;
}

/**
 * Contains the public suffix ruleset as a Trie for efficient look-up.
 */
export default class SuffixTrie {
  public exceptions: ITrieObject;
  public rules: ITrieObject;

  constructor(rules: IRule[]) {
    this.exceptions = Object.create(null);
    this.rules = Object.create(null);

    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      if (rule.exception) {
        insertInTrie(rule, this.exceptions);
      } else {
        insertInTrie(rule, this.rules);
      }
    }
  }

  /**
   * Check if `value` is a valid TLD.
   */
  public hasTld(value: string): boolean {
    // All TLDs are at the root of the Trie.
    return this.rules[value] !== undefined;
  }

  /**
   * Check if `hostname` has a valid public suffix in `trie`.
   */
  public suffixLookup(hostname: string, options: IOptions): IPublicSuffix | null {
    const allowIcannDomains = options.allowIcannDomains;
    const allowPrivateDomains = options.allowPrivateDomains;

    const hostnameParts = hostname.split('.');
    let parts = hostnameParts;

    // Check if at least one label is puny-encoded. If so, then copy `parts` and
    // decode all label which it contains. The original encoded version will
    // still be accessed through `hostnameParts`. This is done lazily with the
    // assumption that most hostnames will not contain punycode in their labels,
    // hence, we save an array copy.
    if (hasPunycode(parts)) {
      parts = decodePunycodeLabels(parts);
    }

    let allowedMask = 0;

    // Define set of accepted public suffix (ICANN, PRIVATE)
    if (allowPrivateDomains === true) {
      allowedMask |= RULE_TYPE.PRIVATE;
    }
    if (allowIcannDomains === true) {
      allowedMask |= RULE_TYPE.ICANN;
    }

    // Look for a match in rules
    const lookupResult = lookupInTrie(
      parts,
      this.rules,
      parts.length - 1,
      allowedMask,
    );

    if (lookupResult.index === -1) {
      return null;
    }

    // Look for exceptions
    const exceptionLookupResult = lookupInTrie(
      parts,
      this.exceptions,
      parts.length - 1,
      allowedMask,
    );

    if (exceptionLookupResult.index !== -1) {
      return {
        isIcann: exceptionLookupResult.isIcann,
        isPrivate: !exceptionLookupResult.isIcann,
        publicSuffix: hostnameParts.slice(exceptionLookupResult.index + 1).join('.'),
      };
    }

    return {
      isIcann: lookupResult.isIcann,
      isPrivate: !lookupResult.isIcann,
      publicSuffix: hostnameParts.slice(lookupResult.index).join('.'),
    };
  }
}
