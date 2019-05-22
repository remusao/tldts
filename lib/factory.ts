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
import getSubdomain from './subdomain';

export interface IResult {
  // `hostname` is either a registered name (including but not limited to a
  // hostname), or an IP address. IPv4 addresses must be in dot-decimal
  // notation, and IPv6 addresses must be enclosed in brackets ([]). This is
  // directly extracted from the input URL.
  hostname: string | null;

  // Is `hostname` an IP? (IPv4 or IPv6)
  isIp: boolean | null;

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
  suffixLookup: (
    _1: string,
    _2: ISuffixLookupOptions,
    _3: IPublicSuffix,
  ) => void,
  partialOptions?: Partial<IOptions>,
): IResult {
  const options: IOptions = setDefaults(partialOptions);
  const result: IResult = {
    domain: null,
    hostname: null,
    isIcann: null,
    isIp: null,
    isPrivate: null,
    publicSuffix: null,
    subdomain: null,
  };

  // Very fast approximate check to make sure `url` is a string. This is needed
  // because the library will not necessarily be used in a typed setup and
  // values of arbitrary types might be given as argument.
  if (typeof url !== 'string') {
    return result;
  }

  // Extract hostname from `url` only if needed. This can be made optional
  // using `options.extractHostname`. This option will typically be used
  // whenever we are sure the inputs to `parse` are already hostnames and not
  // arbitrary URLs.
  //
  // `mixedInput` allows to specify if we expect a mix of URLs and hostnames
  // as input. If only hostnames are expected then `extractHostname` can be
  // set to `false` to speed-up parsing. If only URLs are expected then
  // `mixedInputs` can be set to `false`. The `mixedInputs` is only a hint
  // and will not change the behavior of the library.
  if (options.extractHostname === false) {
    result.hostname = url;
  } else if (options.mixedInputs === true) {
    result.hostname = extractHostname(url, isValidHostname(url));
  } else {
    result.hostname = extractHostname(url, false);
  }

  if (step === FLAG.HOSTNAME || result.hostname === null) {
    return result;
  }

  // Check if `hostname` is a valid ip address
  if (options.detectIp === true) {
    result.isIp = isIp(result.hostname);
    if (result.isIp === true) {
      return result;
    }
  }

  // Perform optional hostname validation. If hostname is not valid, no need to
  // go further as there will be no valid domain or sub-domain.
  if (
    options.validateHostname === true &&
    options.extractHostname === true &&
    isValidHostname(result.hostname) === false
  ) {
    result.hostname = null;
    return result;
  }

  // Extract public suffix
  suffixLookup(result.hostname, options, result);
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
