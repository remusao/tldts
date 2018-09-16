import * as punycode from 'punycode';
import { startsWith } from '../polyfill';
import SuffixTrie from '../suffix-trie';

/**
 * Parse a one-domain-per-line file
 */
export default function parse(body: string) {
  const beginPrivateDomains = '// ===BEGIN PRIVATE DOMAINS===';
  const lines = body.split('\n');

  const rules = [];
  let isIcann = true;

  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i].trim();

    // Ignore empty lines
    if (line.length === 0) { continue; }

    // Comment (check for beginning of Private domains section)
    if (startsWith(line, '//')) {
      if (startsWith(line, beginPrivateDomains)) {
        isIcann = false;
      }

      continue;
    }

    // TODO - Ignore leading or trailing dot

    // Only read line up to the first white-space
    const spaceIndex = line.indexOf(' ');
    if (spaceIndex !== -1) {
      line = line.substr(0, spaceIndex);
    }

    // Check if the rule is an exception
    let exception = false;
    if (line[0] === '!') {
      line = line.substr(1);
      exception = true;
    }

    const parts = line.split('.').reverse();

    // There should be no rule puny-encoded, but this allows users of the
    // library to specify custom rules which could be encoded. This will make
    // sure that all rules are decoded.
    for (let j = 0; j < parts.length; j += 1) {
      const part = parts[j];
      if (startsWith(part, 'xn--')) {
        parts[j] = punycode.toUnicode(part);
      }
    }

    rules.push({
      exception,
      isIcann,
      parts,
      source: lines[i],
    });
  }

  return new SuffixTrie(rules);
}
