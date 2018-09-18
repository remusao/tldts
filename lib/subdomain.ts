/**
 * Returns the subdomain of a hostname string
 */
export default function getSubdomain(hostname: string, domain: string | null): string | null {
  // No domain found? Just abort, abort!
  if (domain === null) {
    return null;
  }

  return hostname.substr(0, hostname.length - domain.length - 1);
}
