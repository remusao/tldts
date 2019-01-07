/**
 * Returns the subdomain of a hostname string
 */
export default function getSubdomain(hostname: string, domain: string): string {
  return hostname.slice(0, -domain.length - 1);
}
