/**
 * Returns the subdomain of a hostname string
 *
 * @param {string} hostname
 * @param {string} domain - the root domain of the hostname
 * @return {string|null} a subdomain string if any, blank string if subdomain
 *  is empty, otherwise null.
 */
export default function getSubdomain(hostname: string, domain: string | null): string | null {
  // No domain found? Just abort, abort!
  if (domain === null) {
    return null;
  }

  return hostname.substr(0, hostname.length - domain.length - 1);
}
