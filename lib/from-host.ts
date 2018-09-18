/**
 * Utility to extract the TLD from a hostname string
 */
export default function extractTldFromHost(hostname: string): string | null {
  const lastDotIndex = hostname.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return null;
  }

  return hostname.substr(lastDotIndex + 1);
}
