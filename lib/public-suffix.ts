import extractTldFromHost from './from-host';
import { IOptions } from './options';
import { hasTld, IPublicSuffix, suffixLookup } from './suffix-trie';

/**
 * Returns the public suffix (including exact matches)
 */
export default function getPublicSuffix(
  hostname: string,
  options: IOptions,
): IPublicSuffix {
  // First check if `hostname` is already a valid top-level Domain.
  if (hasTld(hostname)) {
    return {
      isIcann: false,
      isPrivate: false,
      publicSuffix: hostname,
    };
  }

  const candidate = suffixLookup(hostname, options);
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
