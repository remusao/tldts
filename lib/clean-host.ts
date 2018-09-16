import isValidHostname from './is-valid';
import { IOptions } from './options';
import { startsWith } from './polyfill';

/**
 * @see https://github.com/oncletom/tld.js/issues/95
 */
function trimTrailingDots(value: string): string {
  if (value[value.length - 1] === '.') {
    return value.slice(0, value.length - 1);
  }
  return value;
}

/**
 * Fast check to avoid calling `trim` when not needed.
 */
function isTrimmingNeeded(value: string): boolean {
  return (
    value.length > 0 && (
      value.charCodeAt(0) <= 32 ||
      value.charCodeAt(value.length - 1) <= 32
    )
  );
}

/**
 * Return `true` if `code` is a character which can be part of a scheme.
 */
function isSchemeChar(code: number): boolean {
  const lowerCaseCode = code | 32;
  return (
    (lowerCaseCode >= 97 && lowerCaseCode <= 122) || // alpha
    (lowerCaseCode >= 48 && lowerCaseCode <= 57) || // digit
    lowerCaseCode === 46 || // '.'
    lowerCaseCode === 45 || // '-'
    lowerCaseCode === 43 // '+'
  );
}

export default function extractHostname(url: string, options: IOptions): string | null {
  // Trim spaces in `url` if needed.
  if (isTrimmingNeeded(url)) {
    url = url.trim();
  }

  // First check if `url` is already a valid hostname.
  if (isValidHostname(url, options)) {
    return trimTrailingDots(url);
  }

  // Extract hostname
  let start = 0;
  let end = url.length;

  // Skip scheme.
  if (startsWith(url, '//')) {
    start = 2;
  } else {
    const indexOfProtocol = url.indexOf('://');
    if (indexOfProtocol !== -1) {
      start = indexOfProtocol + 3;

      // Check that scheme is valid
      for (let i = 0; i < indexOfProtocol; i += 1) {
        if (!isSchemeChar(url.charCodeAt(i))) {
          return null;
        }
      }
    }
  }

  // Detect first slash
  const indexOfSlash = url.indexOf('/', start);
  if (indexOfSlash !== -1) {
    end = indexOfSlash;
  }

  // Detect parameters: '?'
  const indexOfParams = url.indexOf('?', start);
  if (indexOfParams !== -1 && indexOfParams < end) {
    end = indexOfParams;
  }

  // Detect fragments: '#'
  const indexOfFragments = url.indexOf('#', start);
  if (indexOfFragments !== -1 && indexOfFragments < end) {
    end = indexOfFragments;
  }

  // Detect identifier: '@'
  const indexOfIdentifier = url.indexOf('@', start);
  if (indexOfIdentifier !== -1 && indexOfIdentifier < end) {
    start = indexOfIdentifier + 1;
  }

  // Handle ipv6 addresses
  if (url.charAt(start) === '[') {
    const indexOfClosingBracket = url.indexOf(']', start);
    if (indexOfClosingBracket !== -1) {
      return url.slice(start + 1, indexOfClosingBracket);
    }
    return null;
  } else {
    // Detect port: ':'
    const indexOfPort = url.indexOf(':', start);
    if (indexOfPort !== -1 && indexOfPort < end) {
      end = indexOfPort;
    }
  }

  return trimTrailingDots(url.slice(start, end));
}
