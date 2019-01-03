import { exceptions, rules } from './data/trie';
import { IPublicSuffix, ISuffixLookupOptions } from './interface';

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
 * Check if `hostname` has a valid public suffix in `trie`.
 */
export default function suffixLookup(
  hostname: string,
  options: ISuffixLookupOptions,
): IPublicSuffix | null {
  const allowIcannDomains = options.allowIcannDomains;
  const allowPrivateDomains = options.allowPrivateDomains;
  const hostnameParts = hostname.split('.');

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
    hostnameParts,
    rules,
    hostnameParts.length - 1,
    allowedMask,
  );

  if (lookupResult.index === -1) {
    return null;
  }

  // Look for exceptions
  const exceptionLookupResult = lookupInTrie(
    hostnameParts,
    exceptions,
    hostnameParts.length - 1,
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
