import * as punycode from 'punycode';
import { exceptions, rules } from './rules';

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

interface IMatch {
  index: number;
  isIcann: boolean;
}

/**
 * Lookup parts of domain in Trie
 */
function lookupInTrie(
  parts: string[],
  trie: any,
  index: number,
  allowedMask: number,
): IMatch {
  let node = trie;
  const lookupResult: IMatch = {
    index: -1,
    isIcann: false,
  };

  while (node !== undefined) {
    // We have a match!
    if (node.$ !== undefined && (node.$ & allowedMask) !== 0) {
      lookupResult.index = index + 1;
      lookupResult.isIcann = node.$ === RULE_TYPE.ICANN;
    }

    // No more `parts` to look for
    if (index === -1) {
      return lookupResult;
    }

    node = node[parts[index]] || node['*'];
    index -= 1;
  }

  return lookupResult;
}

/**
 * Check if there is any non-ascii character in hostname
 */
function hasUnicode(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    if (value.charCodeAt(i) > 127) {
      return true;
    }
  }
  return false;
}

export function hasTld(value: string): boolean {
  // All TLDs are at the root of the Trie.
  return rules[value] !== undefined;
}

/**
 * Check if `hostname` has a valid public suffix in `trie`.
 */
export function suffixLookup(
  hostname: string,
  options: IOptions,
): IPublicSuffix | null {
  const allowIcannDomains = options.allowIcannDomains;
  const allowPrivateDomains = options.allowPrivateDomains;
  const hostnameParts = hostname.split('.');
  let parts = hostnameParts;

  if (hasUnicode(hostname)) {
    parts = punycode.toASCII(hostname).split('.');
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
    rules,
    parts.length - 1,
    allowedMask,
  );

  if (lookupResult.index === -1) {
    return null;
  }

  // Look for exceptions
  const exceptionLookupResult = lookupInTrie(
    parts,
    exceptions,
    parts.length - 1,
    allowedMask,
  );

  if (exceptionLookupResult.index !== -1) {
    return {
      isIcann: exceptionLookupResult.isIcann,
      isPrivate: !exceptionLookupResult.isIcann,
      publicSuffix: hostnameParts
        .slice(exceptionLookupResult.index + 1)
        .join('.'),
    };
  }

  return {
    isIcann: lookupResult.isIcann,
    isPrivate: !lookupResult.isIcann,
    publicSuffix: hostnameParts.slice(lookupResult.index).join('.'),
  };
}
