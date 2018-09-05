import getRules from './rules';
import Trie from './suffix-trie';

// Internals
import getDomainImpl from './domain';
import isIpImpl from './is-ip';
import isValidHostnameImpl from './is-valid';
import { IOptions, setDefaults } from './options';
import getPublicSuffixImpl from './public-suffix';
import getSubdomainImpl from './subdomain';
import tldExistsImpl from './tld-exists';

interface IResult {
  domain: string | null;
  hostname: string | null;
  isIcann: boolean | null;
  isIp: boolean;
  isPrivate: boolean | null;
  isValidHostname: boolean | null;
  publicSuffix: string | null;
  subdomain: string | null;
  tldExists: boolean | null;

}

// Flags representing steps in the `parse` function. They are used to implement
// an early stop mechanism (simulating some form of laziness) to avoid doing
// more work than necessary to perform a given action (e.g.: we don't need to
// extract the domain and subdomain if we are only interested in public suffix).
const enum FLAG {
  HOSTNAME,
  TLD_EXISTS,
  PUBLIC_SUFFIX,
  DOMAIN,
  SUB_DOMAIN,
  ALL,
}

/**
 * Process a given url and extract all information. This is a higher level API
 * around private functions of `tld.js`. It allows to remove duplication (only
 * extract hostname from url once for all operations) and implement some early
 * termination mechanism to not pay the price of what we don't need (this
 * simulates laziness at a lower cost).
 *
 * @param {string} url
 * @param {number|undefined} _step - where should we stop processing
 * @return {object}
 */
const parseImpl = (() => {
  const trie: Trie = getRules();
  return (url: string, partialOptions?: Partial<IOptions>, step: FLAG = FLAG.ALL): IResult => {
    const options: IOptions = setDefaults(partialOptions);

    const result: IResult = {
      domain: null,
      hostname: options.extractHostname(url, options),
      isIcann: null,
      isIp: false,
      isPrivate: null,
      isValidHostname: null,
      publicSuffix: null,
      subdomain: null,
      tldExists: null,
    };

    if (result.hostname === null) {
      result.isIp = false;
      result.isValidHostname = false;
      return result;
    }

    // Check if `hostname` is a valid ip address
    result.isIp = isIpImpl(result.hostname);
    if (result.isIp) {
      result.isValidHostname = true;
      return result;
    }

    // Check if `hostname` is valid
    result.isValidHostname = isValidHostnameImpl(result.hostname, options);
    if (result.isValidHostname === false) { return result; }
    if (step === FLAG.HOSTNAME) { return result; }

    // Check if tld exists
    result.tldExists = tldExistsImpl(trie, result.hostname);
    if (step === FLAG.TLD_EXISTS) { return result; }

    // Extract public suffix
    const publicSuffixResult = getPublicSuffixImpl(
      trie,
      result.hostname,
      options,
    );

    result.publicSuffix = publicSuffixResult.publicSuffix;
    result.isPrivate = publicSuffixResult.isPrivate;
    result.isIcann = publicSuffixResult.isIcann;
    if (step === FLAG.PUBLIC_SUFFIX) { return result; }

    // Extract domain
    result.domain = getDomainImpl(result.publicSuffix, result.hostname, options);
    if (step === FLAG.DOMAIN) { return result; }

    // Extract subdomain
    result.subdomain = getSubdomainImpl(result.hostname, result.domain);

    return result;
  };
})();

export function parse(url: string, options?: Partial<IOptions>) {
  return parseImpl(url, options);
}

export function isValidHostname(url: string, options ?: Partial<IOptions>): boolean {
  return isValidHostnameImpl(url, setDefaults(options));
}

export function tldExists(url: string, options ?: Partial<IOptions>): boolean | null {
  return parseImpl(url, options, FLAG.TLD_EXISTS).tldExists;
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
  return parseImpl(url, options, FLAG.HOSTNAME).hostname;
}
