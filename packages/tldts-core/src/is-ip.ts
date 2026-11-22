/**
 * Detection of IP addresses, as defined by the host parser of the WHATWG URL
 * standard (https://url.spec.whatwg.org/#host-parsing), which browsers follow.
 * Addresses are recognized, never rewritten: `0x7f.1` is 127.0.0.1 for a
 * browser, hence an IP here, but stays `0x7f.1`.
 */

/**
 * Value of the hexadecimal digit `code` (0 to 15), or 16 if it is not one.
 */
function hexValue(code: number): number {
  if (code >= 48 && code <= 57) {
    return code - 48; // 0-9
  }
  const letter = code | 32; // lower-case
  return letter >= 97 && letter <= 102 ? letter - 87 : 16; // a-f
}

/**
 * Check if `hostname` is an IPv4 address: one to four numbers separated by
 * dots, each one decimal, octal (leading `0`) or hexadecimal (leading `0x`).
 * The last number fills the bytes the others leave, so `127.1` and
 * `2130706433` are both 127.0.0.1.
 * https://url.spec.whatwg.org/#concept-ipv4-parser
 */
function isIpv4(hostname: string): boolean {
  const end = hostname.length;
  let i = 0;

  for (let numbers = 1; numbers <= 4; numbers += 1) {
    let radix = 10;
    if (i + 1 < end && hostname.charCodeAt(i) === 48 /* '0' */) {
      radix = 8;
      if ((hostname.charCodeAt(i + 1) | 32) === 120 /* 'x' */) {
        radix = 16;
        i += 2;
      }
    }

    const start = i;
    let value = 0;
    for (; i < end; i += 1) {
      const code = hostname.charCodeAt(i);
      if (code === 46 /* '.' */) {
        break;
      }
      const digit = hexValue(code);
      if (digit >= radix) {
        return false;
      }
      value = value * radix + digit;
    }

    // A number has digits, except "0x" which is 0.
    if (i === start && radix !== 16) {
      return false;
    }

    if (i === end) {
      return value <= 0xffffffff >>> (8 * (numbers - 1));
    }
    if (value > 255) {
      return false;
    }
    i += 1; // '.'
  }

  return false;
}

/**
 * Check if `hostname` is probably an IPv6 address.
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

  // We only consider the maximum size of a normal IPV6. Note that this will
  // fail on so-called "IPv4 mapped IPv6 addresses" but this is a corner-case
  // and a proper validation library should be used for these.
  if (end - start > 39) {
    return false;
  }

  let hasColon = false;

  for (; start < end; start += 1) {
    const code = hostname.charCodeAt(start);

    if (code === 58 /* ':' */) {
      hasColon = true;
    } else if (!(
      (code >= 48 && code <= 57) || // 0-9
      (code >= 97 && code <= 102) || // a-f
      (code >= 65 && code <= 70) // A-F (RFC 4291 §2.2: an IPv6 hextet is hex digits only)
    )) {
      return false;
    }
  }

  return hasColon;
}

/**
 * Check if `hostname` is an IP address (either IPv4 or IPv6).
 *
 * The answer is `null` for a host ending in a number without being an IPv4
 * address (`1.2.3.4.5`, `example.123`): browsers read such a host as an
 * address and nothing else, so it is not a valid host, and never a domain.
 * `hostname` has no trailing dot: callers strip them.
 */
export default function isIp(hostname: string): boolean | null {
  // Go backward over the digits ending `hostname`, decimal ones first, then
  // hexadecimal ones, down to `code`, the character before them (NaN before
  // the start of `hostname`). It tells what `hostname` may be, and most often
  // that it is not an address.
  const last = hostname.length - 1;
  let i = last;
  let code = hostname.charCodeAt(i);
  while (code >= 48 && code <= 57 /* 0-9 */) {
    i -= 1;
    code = hostname.charCodeAt(i);
  }
  const decimal = i;
  while (hexValue(code) !== 16) {
    i -= 1;
    code = hostname.charCodeAt(i);
  }

  // An IPv6 address ends with a group, which follows a ':', with "::" or
  // with a ']'. Its last label is not a number then.
  if (code === 58 /* ':' */ || code === 93 /* ']' */) {
    return isProbablyIpv6(hostname);
  }

  // An IPv4 address ends with a number: a last label only made of decimal
  // digits, or of "0x" followed by hexadecimal digits.
  // https://url.spec.whatwg.org/#ends-in-a-number-checker
  if (
    (i === decimal && i !== last && (code === 46 /* '.' */ || i === -1)) ||
    ((code | 32) === 120 /* 'x' */ &&
      hostname.charCodeAt(i - 1) === 48 /* '0' */ &&
      (i === 1 || hostname.charCodeAt(i - 2) === 46)) /* '.' */
  ) {
    return isIpv4(hostname) ? true : null;
  }

  return false;
}
