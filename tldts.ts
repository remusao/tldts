import parseRules from './lib/parsers/publicsuffix-org';
import getRules from './lib/rules';
import Trie from './lib/suffix-trie';

// Internals
import getDomainImpl from './lib/domain';
import isIpImpl from './lib/is-ip';
import isValidHostnameImpl from './lib/is-valid';
import { IOptions, setDefaults } from './lib/options';
import getPublicSuffixImpl from './lib/public-suffix';
import getSubdomainImpl from './lib/subdomain';

interface IResult {
  // `host` is either a registered name (including but not limited to a
  // hostname), or an IP address. IPv4 addresses must be in dot-decimal
  // notation, and IPv6 addresses must be enclosed in brackets ([]). This is
  // directly extracted from the input URL.
  host: string | null;
  // Is `host` a valid hostname?
  isValid: boolean | null;
  // Is `host` an IP? (IPv4 or IPv6)
  isIp: boolean;

  // `host` split between subdomain, domain and its public suffix (if any)
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
const enum FLAG {
  HOST,
  PUBLIC_SUFFIX,
  DOMAIN,
  SUB_DOMAIN,
  ALL,
}

function parseImplFactory(trie: Trie = getRules()) {
  return (url: string, partialOptions?: Partial<IOptions>, step: FLAG = FLAG.ALL): IResult => {
    const options: IOptions = setDefaults(partialOptions);

    const result: IResult = {
      domain: null,
      host: null,
      isIcann: null,
      isIp: false,
      isPrivate: null,
      isValid: null,
      publicSuffix: null,
      subdomain: null,
    };

    const host = options.extractHostname(url, options);
    if (host === null) {
      result.isIp = false;
      result.isValid = false;
      return result;
    }

    result.host = host.toLowerCase();

    // Check if `host` is a valid ip address
    result.isIp = isIpImpl(result.host);
    if (result.isIp) {
      result.isValid = true;
      return result;
    }

    // Check if `host` is valid
    result.isValid = isValidHostnameImpl(result.host, options);
    if (result.isValid === false) { return result; }
    if (step === FLAG.HOST) { return result; }

    // Extract public suffix
    const publicSuffixResult = getPublicSuffixImpl(
      trie,
      result.host,
      options,
    );

    result.publicSuffix = publicSuffixResult.publicSuffix;
    result.isPrivate = publicSuffixResult.isPrivate;
    result.isIcann = publicSuffixResult.isIcann;
    if (step === FLAG.PUBLIC_SUFFIX) { return result; }

    // Extract domain
    result.domain = getDomainImpl(result.publicSuffix, result.host, options);
    if (step === FLAG.DOMAIN) { return result; }

    // Extract subdomain
    result.subdomain = getSubdomainImpl(result.host, result.domain);

    return result;
  };
}

/**
 * Process a given url and extract all information. This is a higher level API
 * around private functions of `tldts`. It allows to remove duplication (only
 * extract host from url once for all operations) and implement some early
 * termination mechanism to not pay the price of what we don't need (this
 * simulates laziness at a lower cost).
 */
let parseImpl = parseImplFactory();

export function update(rules: string) {
  parseImpl = parseImplFactory(parseRules(rules));
}

export function reset() {
  parseImpl = parseImplFactory();
}

export function parse(url: string, options?: Partial<IOptions>) {
  return parseImpl(url, options);
}

export function isValidHostname(url: string, options ?: Partial<IOptions>): boolean {
  return isValidHostnameImpl(url, setDefaults(options));
}

export function getPublicSuffix(url: string, options ?: Partial<IOptions>): string | null {
  return parseImpl(url, options, FLAG.PUBLIC_SUFFIX).publicSuffix;
}

export function getDomain(url: string, options ?: Partial<IOptions>): string | null {
  return parseImpl(url, options, FLAG.DOMAIN).domain;
}

export function getSubdomain(url: string, options ?: Partial<IOptions>): string | null {
  return parseImpl(url, options, FLAG.SUB_DOMAIN).subdomain;
}

export function getHostname(url: string, options ?: Partial<IOptions>): string | null {
  return parseImpl(url, options, FLAG.HOST).host;
}
