import { exceptions, ITrie, rules } from './data/trie';
import { IPublicSuffix, ISuffixLookupOptions } from './interface';

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
    if ((node.$ & allowedMask) !== 0) {
      result = {
        index: index + 1,
        isIcann: node.$ === RULE_TYPE.ICANN,
        isPrivate: node.$ === RULE_TYPE.PRIVATE,
      };
    }

    // No more `parts` to look for
    if (index === -1) {
      break;
    }

    const succ: {
      [label: string]: ITrie;
    } = node.succ;
    node = succ && (succ[parts[index]] || succ['*']);
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
  // Fast path for very popular suffixes; this allows to by-pass lookup
  // completely as well as any extra allocation or string manipulation.
  if (options.allowPrivateDomains === false && hostname.length > 3) {
    const last: number = hostname.length - 1;
    const c3: number = hostname.charCodeAt(last);
    const c2: number = hostname.charCodeAt(last - 1);
    const c1: number = hostname.charCodeAt(last - 2);
    const c0: number = hostname.charCodeAt(last - 3);

    if (
      c3 === 109 /* 'm' */ &&
      c2 === 111 /* 'o' */ &&
      c1 === 99 /* 'c' */ &&
      c0 === 46 /* '.' */
    ) {
      out.isIcann = true;
      out.isPrivate = false;
      out.publicSuffix = 'com';
      return;
    } else if (
      c3 === 103 /* 'g' */ &&
      c2 === 114 /* 'r' */ &&
      c1 === 111 /* 'o' */ &&
      c0 === 46 /* '.' */
    ) {
      out.isIcann = true;
      out.isPrivate = false;
      out.publicSuffix = 'org';
      return;
    } else if (
      c3 === 117 /* 'u' */ &&
      c2 === 100 /* 'd' */ &&
      c1 === 101 /* 'e' */ &&
      c0 === 46 /* '.' */
    ) {
      out.isIcann = true;
      out.isPrivate = false;
      out.publicSuffix = 'edu';
      return;
    } else if (
      c3 === 118 /* 'v' */ &&
      c2 === 111 /* 'o' */ &&
      c1 === 103 /* 'g' */ &&
      c0 === 46 /* '.' */
    ) {
      out.isIcann = true;
      out.isPrivate = false;
      out.publicSuffix = 'gov';
      return;
    } else if (
      c3 === 116 /* 't' */ &&
      c2 === 101 /* 'e' */ &&
      c1 === 110 /* 'n' */ &&
      c0 === 46 /* '.' */
    ) {
      out.isIcann = true;
      out.isPrivate = false;
      out.publicSuffix = 'net';
      return;
    } else if (
      c3 === 101 /* 'e' */ &&
      c2 === 100 /* 'd' */ &&
      c1 === 46 /* '.' */
    ) {
      out.isIcann = true;
      out.isPrivate = false;
      out.publicSuffix = 'de';
      return;
    }
  }

  const hostnameParts = hostname.split('.');

  const allowedMask =
    (options.allowPrivateDomains === true ? RULE_TYPE.PRIVATE : 0) |
    (options.allowIcannDomains === true ? RULE_TYPE.ICANN : 0);

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
    out.publicSuffix = hostnameParts.slice(exceptionMatch.index + 1).join('.');
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
    out.publicSuffix = hostnameParts.slice(rulesMatch.index).join('.');
    return;
  }

  // No match found...
  // Prevailing rule is '*' so we consider the top-level domain to be the
  // public suffix of `hostname` (e.g.: 'example.org' => 'org').
  out.isIcann = false;
  out.isPrivate = false;
  out.publicSuffix = hostnameParts[hostnameParts.length - 1];
}
