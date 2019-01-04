import tldtsFactory, { FLAG } from './lib/factory';
import suffixLookup from './lib/lookup/packed-hashes';
import { IOptions } from './lib/options';

export const parse = tldtsFactory(suffixLookup);

export function getPublicSuffix(
  url: string,
  options?: Partial<IOptions>,
): string | null {
  return parse(url, options, FLAG.PUBLIC_SUFFIX).publicSuffix;
}

export function getDomain(
  url: string,
  options?: Partial<IOptions>,
): string | null {
  return parse(url, options, FLAG.DOMAIN).domain;
}

export function getSubdomain(
  url: string,
  options?: Partial<IOptions>,
): string | null {
  return parse(url, options, FLAG.SUB_DOMAIN).subdomain;
}

export function getHostname(
  url: string,
  options?: Partial<IOptions>,
): string | null {
  return parse(url, options, FLAG.HOSTNAME).hostname;
}
