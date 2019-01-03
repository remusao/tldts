import { IPublicSuffix, ISuffixLookupOptions } from './lookup/interface';
import { IOptions } from './options';

/**
 * Utility to extract the TLD from a hostname string
 */
function extractTldFromHost(hostname: string): string | null {
  const lastDotIndex = hostname.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // Single label is considered a tld
    return hostname;
  }

  return hostname.slice(lastDotIndex + 1);
}

/**
 * Returns the public suffix (including exact matches)
 */
export default function getPublicSuffix(
  hostname: string,
  options: IOptions,
  suffixLookup: (_1: string, _2: ISuffixLookupOptions) => IPublicSuffix | null,
): IPublicSuffix {
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
