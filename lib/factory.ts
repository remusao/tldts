/**
 * Implement a factory allowing to plug different implementations of suffix
 * lookup (e.g.: using a trie or the packed hashes datastructures). This is used
 * and exposed in `tldts.ts` and `tldts-experimental.ts` bundle entrypoints.
 */

import getDomainImpl from './domain';
import isIpImpl from './is-ip';
import validateHostnameShape from './is-valid';
import { IPublicSuffix, ISuffixLookupOptions } from './lookup/interface';
import { IOptions, setDefaults } from './options';
import getPublicSuffixImpl from './public-suffix';
import getSubdomainImpl from './subdomain';

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

export default (
  suffixLookup: (_1: string, _2: ISuffixLookupOptions) => IPublicSuffix | null,
) => (
  url: string,
  partialOptions?: Partial<IOptions>,
  step: FLAG = FLAG.ALL,
): IResult => {
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

  // Extract hostname from `url`
  const hostname = options.extractHostname(url);
  if (hostname === null) {
    result.isIp = false;
    return result;
  }
  result.hostname = hostname.toLowerCase();
  if (step === FLAG.HOSTNAME) {
    return result;
  }

  // Check if `hostname` is a valid ip address
  result.isIp = isIpImpl(result.hostname);
  if (result.isIp) {
    return result;
  }

  // Make sure hostname is valid before proceeding
  if (validateHostnameShape(hostname) === false) {
    return result;
  }

  // Extract public suffix
  const publicSuffixResult = getPublicSuffixImpl(
    result.hostname,
    options,
    suffixLookup,
  );

  result.publicSuffix = publicSuffixResult.publicSuffix;
  result.isIcann = publicSuffixResult.isIcann;
  result.isPrivate = publicSuffixResult.isIcann === false;
  if (step === FLAG.PUBLIC_SUFFIX) {
    return result;
  }

  // Extract domain
  result.domain = getDomainImpl(result.publicSuffix, result.hostname, options);
  if (step === FLAG.DOMAIN) {
    return result;
  }

  // Extract subdomain
  result.subdomain = getSubdomainImpl(result.hostname, result.domain);

  return result;
};
