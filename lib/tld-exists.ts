import extractTldFromHost from './from-host';
import SuffixTrie from './suffix-trie';

/**
 * Checks if the TLD exists for a given hostname
 */
export default function tldExists(rules: SuffixTrie, hostname: string): boolean {
  // Easy case, it's a TLD
  if (rules.hasTld(hostname)) {
    return true;
  }

  // Popping only the TLD of the hostname
  const hostTld = extractTldFromHost(hostname);
  if (hostTld === null) {
    return false;
  }

  return rules.hasTld(hostTld);
}
