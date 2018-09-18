/**
 * Check if a hostname is an IP. You should be aware that this only works
 * because `hostname` is already garanteed to be a valid hostname!
 */
function isProbablyIpv4(hostname: string): boolean {
  let numberOfDots = 0;

  for (let i = 0; i < hostname.length; i += 1) {
    const code = hostname.charCodeAt(i);

    if (code === 46) { // '.'
      numberOfDots += 1;
    } else if (code < 48 || code > 57) {
      // 48 => '0'
      // 57 => '9'
      return false;
    }
  }

  return (
    numberOfDots === 3  &&
    hostname[0] !== '.' &&
    hostname[hostname.length - 1] !== '.'
  );
}

/**
 * Similar to isProbablyIpv4.
 */
function isProbablyIpv6(hostname: string): boolean {
  let hasColon = false;

  for (let i = 0; i < hostname.length; i += 1) {
    const code = hostname.charCodeAt(i);

    if (code === 58) { // ':'
      hasColon = true;
    } else if (!(
      (code >= 48 && code <= 57) || // 0-9
      (code >= 97 && code <= 102)   // a-f
    )) {
      return false;
    }
  }

  return hasColon;
}

/**
 * Check if `hostname` is *probably* a valid ip addr (either ipv6 or ipv4).
 * This *will not* work on any string. We need `hostname` to be a valid
 * hostname.
 */
export default function isIp(hostname: string): boolean {
  return (isProbablyIpv6(hostname) || isProbablyIpv4(hostname));
}
