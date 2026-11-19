/**
 * Check if a hostname is an IP. You should be aware that this only works
 * because `hostname` is already garanteed to be a valid hostname!
 */
function isProbablyIpv4(hostname: string): boolean {
  // Cannot be shorted than 1.1.1.1
  if (hostname.length < 7) {
    return false;
  }

  // Cannot be longer than: 255.255.255.255
  if (hostname.length > 15) {
    return false;
  }

  let numberOfDots = 0;

  for (let i = 0; i < hostname.length; i += 1) {
    const code = hostname.charCodeAt(i);

    if (code === 46 /* '.' */) {
      numberOfDots += 1;
    } else if (code < 48 /* '0' */ || code > 57 /* '9' */) {
      return false;
    }
  }

  return (
    numberOfDots === 3 &&
    hostname.charCodeAt(0) !== 46 /* '.' */ &&
    hostname.charCodeAt(hostname.length - 1) !== 46 /* '.' */
  );
}

/**
 * Similar to isProbablyIpv4.
 */
function isProbablyIpv6(hostname: string): boolean {
  if (hostname.length < 3) {
    return hostname === '::';
  }

  let start = hostname.startsWith('[') ? 1 : 0;
  let end = hostname.length;

  if (hostname[end - 1] === ']') {
    end -= 1;
  }

  // 45 is the longest IPv6 address that ends with an IPv4 address
  // ("ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255"). Without the IPv4 part
  // the limit is 39, checked below.
  if (end - start > 45) {
    return false;
  }

  let hasColon = false;
  let hasDot = false;
  let lastColon = -1;
  const length = end - start;

  for (; start < end; start += 1) {
    const code = hostname.charCodeAt(start);

    if (code === 58 /* ':' */) {
      // A ':' can not follow the IPv4 part
      if (hasDot) {
        return false;
      }
      hasColon = true;
      lastColon = start;
    } else if (code === 46 /* '.' */) {
      hasDot = true;
    } else if (!(
      (code >= 48 && code <= 57) || // 0-9
      (code >= 97 && code <= 102) || // a-f
      (code >= 65 && code <= 70) // A-F (RFC 4291 §2.2: an IPv6 hextet is hex digits only)
    )) {
      return false;
    }
  }

  if (!hasColon) {
    return false;
  }

  if (!hasDot) {
    return length <= 39;
  }

  // RFC 4291 §2.2 (form 3): "x:x:x:x:x:x:d.d.d.d", the part after the last ':'
  // has to be an IPv4 address.
  return isProbablyIpv4(hostname.slice(lastColon + 1, end));
}

/**
 * Check if `hostname` is *probably* a valid ip addr (either ipv6 or ipv4).
 * This *will not* work on any string. We need `hostname` to be a valid
 * hostname.
 */
export default function isIp(hostname: string): boolean {
  return isProbablyIpv6(hostname) || isProbablyIpv4(hostname);
}
