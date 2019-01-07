/**
 * Implement a factory allowing to plug different implementations of suffix
 * lookup (e.g.: using a trie or the packed hashes datastructures). This is used
 * and exposed in `tldts.ts` and `tldts-experimental.ts` bundle entrypoints.
 */

import getDomain from './domain';
import extractHostname from './extract-hostname';
import isIp from './is-ip';
import isValidHostname from './is-valid';
import { IPublicSuffix, ISuffixLookupOptions } from './lookup/interface';
import { IOptions, setDefaults } from './options';
import getPublicSuffix from './public-suffix';
import getSubdomain from './subdomain';

export interface IResult {
  // `hostname` is either a registered name (including but not limited to a
  // hostname), or an IP address. IPv4 addresses must be in dot-decimal
  // notation, and IPv6 addresses must be enclosed in brackets ([]). This is
  // directly extracted from the input URL.
  hostname: string | null;

  // Is `hostname` an IP? (IPv4 or IPv6)
  isIp: boolean;

  // `hostname` split between subdomain, domain and its public suffix (if any)
  subdomain: string | null;
  domain: string | null;
  publicSuffix: string | null;

  // Specifies if `publicSuffix` comes from the ICANN or PRIVATE section of the list
  isIcann: boolean | null;
  isPrivate: boolean | null;
}

// Flags representing steps in the `parse` function. They are used to implement
// an early stop mechanism (simulating some form of laziness) to avoid doing
// more work than necessary to perform a given action (e.g.: we don't need to
// extract the domain and subdomain if we are only interested in public suffix).
export const enum FLAG {
  HOSTNAME,
  IS_VALID,
  PUBLIC_SUFFIX,
  DOMAIN,
  SUB_DOMAIN,
  ALL,
}

export default function parseImpl(
  url: string,
  step: FLAG,
  suffixLookup: (_1: string, _2: ISuffixLookupOptions) => IPublicSuffix | null,
  partialOptions?: Partial<IOptions>,
): IResult {
  const options: IOptions = setDefaults(partialOptions);
  const result: IResult = {
    domain: null,
    hostname: null,
    isIcann: null,
    isIp: false,
    isPrivate: null,
    publicSuffix: null,
    subdomain: null,
  };

  // Extract hostname from `url` only if needed
  if (options.extractHostname === false) {
    result.hostname = url;

    if (step === FLAG.HOSTNAME) {
      return result;
    }
  } else {
    const urlIsValidHostname = isValidHostname(url);
    result.hostname = extractHostname(url, urlIsValidHostname);

    if (step === FLAG.HOSTNAME || result.hostname === null) {
      return result;
    }

    // Check if `hostname` is a valid ip address
    result.isIp = isIp(result.hostname);
    if (result.isIp) {
      return result;
    }

    // Make sure hostname is valid before proceeding
    if (
      urlIsValidHostname === false &&
      isValidHostname(result.hostname) === false
    ) {
      return result;
    }
  }

  // Extract public suffix
  const publicSuffixResult = getPublicSuffix(
    result.hostname,
    options,
    suffixLookup,
  );

  result.publicSuffix = publicSuffixResult.publicSuffix;
  result.isIcann = publicSuffixResult.isIcann;
  result.isPrivate = publicSuffixResult.isIcann === false;
  if (step === FLAG.PUBLIC_SUFFIX || result.publicSuffix === null) {
    return result;
  }

  // Extract domain
  result.domain = getDomain(result.publicSuffix, result.hostname, options);
  if (step === FLAG.DOMAIN || result.domain === null) {
    return result;
  }

  // Extract subdomain
  result.subdomain = getSubdomain(result.hostname, result.domain);

  return result;
}
