import extractTldFromHost from './from-host';
import { IOptions } from './options';
import Trie from './suffix-trie';

export interface IPublicSuffix {
  isIcann: boolean;
  isPrivate: boolean;
  publicSuffix: string | null;
}

/**
 * Returns the public suffix (including exact matches)
 */
export default function getPublicSuffix(rules: Trie, hostname: string, options: IOptions): IPublicSuffix {
  // First check if `hostname` is already a valid top-level Domain.
  if (rules.hasTld(hostname)) {
    return {
      isIcann: false,
      isPrivate: false,
      publicSuffix: hostname,
    };
  }

  const candidate = rules.suffixLookup(hostname, options);
  if (candidate === null) {
    // Prevailing rule is '*' so we consider the top-level domain to be the
    // public suffix of `hostname` (e.g.: 'example.org' => 'org').
    return {
      isIcann: false,
      isPrivate: false,
      publicSuffix: extractTldFromHost(hostname),
    };
  }

  return candidate;
}
