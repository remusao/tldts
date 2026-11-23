/**
 * Detection of IP addresses, as defined by the host parser of the WHATWG URL
 * standard (https://url.spec.whatwg.org/#host-parsing), which browsers follow.
 * Addresses are recognized, never rewritten: `0x7f.1` is 127.0.0.1 for a
 * browser, hence an IP here, but stays `0x7f.1`.
 */

import {
  ipMappingBlocks,
  ipMappingFirst,
  ipMappingLast,
  ipMappingValue,
} from './ip-mapping';

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
 * Check if `hostname[i, end)` is made of four decimal numbers separated by
 * dots, each one between 0 and 255 and without leading zero.
 */
function isDottedDecimal(hostname: string, i: number, end: number): boolean {
  for (let numbers = 1; numbers <= 4; numbers += 1) {
    const start = i;
    let value = 0;
    for (; i < end; i += 1) {
      const digit = hostname.charCodeAt(i) - 48;
      if (digit < 0 || digit > 9) {
        break;
      }
      value = value * 10 + digit;
      // Only a leading zero keeps a number of several digits below 10.
      if (value > 255 || (value < 10 && i !== start)) {
        return false;
      }
    }

    if (i === start) {
      return false;
    }
    if (numbers < 4) {
      if (hostname.charCodeAt(i) !== 46 /* '.' */) {
        return false;
      }
      i += 1;
    }
  }

  return i === end;
}

/**
 * Check if `hostname` is an IPv6 address, with or without its brackets: eight
 * groups of one to four hexadecimal digits separated by colons, where a `::`
 * may stand once for one or more missing groups, and a dotted-decimal IPv4
 * address may stand for the last two.
 * https://url.spec.whatwg.org/#concept-ipv6-parser
 */
function isIpv6(hostname: string): boolean {
  let i = 0;
  let end = hostname.length;

  if (hostname.charCodeAt(0) === 91 /* '[' */) {
    if (hostname.charCodeAt(end - 1) !== 93 /* ']' */) {
      return false;
    }
    i = 1;
    end -= 1;
  }

  // An address only starts with a ':' if it starts with "::".
  if (i < end && hostname.charCodeAt(i) === 58 /* ':' */) {
    if (i + 1 === end || hostname.charCodeAt(i + 1) !== 58 /* ':' */) {
      return false;
    }
    i += 1;
  }

  let groups = 0;
  let compressed = false; // "::" was seen, and counted as one group

  // Here `i` is where a group starts: a ':' can only be the second of a "::".
  while (i < end && groups < 8) {
    if (hostname.charCodeAt(i) === 58 /* ':' */) {
      if (compressed) {
        return false;
      }
      compressed = true;
      groups += 1;
      i += 1;
      continue;
    }

    const start = i;
    while (
      i < end &&
      i - start < 4 &&
      hexValue(hostname.charCodeAt(i)) !== 16
    ) {
      i += 1;
    }
    if (i === start) {
      return false;
    }
    if (i === end) {
      return compressed || groups === 7;
    }

    if (hostname.charCodeAt(i) === 46 /* '.' */) {
      return (
        (compressed ? groups <= 6 : groups === 6) &&
        isDottedDecimal(hostname, start, end)
      );
    }

    // Anything else is a ':' followed by another group, or by a ':'.
    if (hostname.charCodeAt(i) !== 58 /* ':' */ || i + 1 === end) {
      return false;
    }
    groups += 1;
    i += 1;
  }

  return compressed && i === end;
}

/**
 * What the host parser of browsers maps the non-ASCII code point `cp` to, as
 * far as IP detection goes: nothing (deleted), '.', digits, 'a'-'f' or 'x', or
 * else 'g', standing for any character that keeps a label from being a number.
 * https://www.unicode.org/reports/tr46/#Processing
 */
function mapCodePoint(cp: number): string {
  // Most letters, as in internationalized domain names, are in blocks of the
  // table without any entry.
  if (
    cp < 0x10000 &&
    ((ipMappingBlocks[cp >> 13]! >>> ((cp >> 8) & 31)) & 1) === 0
  ) {
    return 'g';
  }
  let low = 0;
  let high = ipMappingFirst.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (cp < ipMappingFirst[mid]!) {
      high = mid - 1;
    } else if (cp > ipMappingLast[mid]!) {
      low = mid + 1;
    } else {
      const value = ipMappingValue[mid]!;
      const offset = cp - ipMappingFirst[mid]!;
      if (value === 0) {
        return '';
      }
      if (value < 128) {
        return String.fromCharCode(value + offset);
      }
      if (value < 2000) {
        return String(value - 1000 + offset);
      }
      return String.fromCharCode(value >> 8, value & 255);
    }
  }
  return 'g';
}

/**
 * `isIp` for a host holding non-ASCII characters, read as browsers read it:
 * they first map some characters to digits or dots and delete others, so that
 * `１２７.０.０.１`, or `127.0.0.1` followed by a zero-width space, is 127.0.0.1
 * for them. The host is mapped the same way, as far as IP detection goes, and
 * checked again.
 */
function isMappedIp(hostname: string): boolean | null {
  // Most such hosts are internationalized domain names, with a character that
  // keeps their last label from being a number: find it first.
  for (let i = hostname.length - 1; i >= 0; i -= 1) {
    let cp = hostname.charCodeAt(i);
    if (cp === 46 /* '.' */) {
      break;
    }
    if (cp < 128) {
      if (hexValue(cp) === 16 && (cp | 32) !== 120 /* 'x' */) {
        return false;
      }
      continue;
    }
    // Most letters are in blocks of 256 code points without any entry.
    if (
      cp < 0xd800 &&
      ((ipMappingBlocks[cp >> 13]! >>> ((cp >> 8) & 31)) & 1) === 0
    ) {
      return false;
    }
    if (cp >= 0xdc00 && cp <= 0xdfff && i > 0) {
      const high = hostname.charCodeAt(i - 1);
      if (high >= 0xd800 && high <= 0xdbff) {
        cp = (high - 0xd800) * 0x400 + (cp - 0xdc00) + 0x10000;
        i -= 1;
      }
    }
    const mapped = mapCodePoint(cp);
    if (mapped === 'g') {
      return false;
    }
    if (mapped === '.') {
      break;
    }
  }

  // Browsers read an IPv6 address, between brackets, as written: a host
  // holding non-ASCII characters is never one.
  if (hostname.includes(':')) {
    return false;
  }

  let ascii = '';
  for (let i = 0; i < hostname.length; i += 1) {
    const code = hostname.charCodeAt(i);
    if (code < 128) {
      ascii += hostname.charAt(i);
    } else {
      let cp = code;
      if (code >= 0xd800 && code <= 0xdbff) {
        const low = hostname.charCodeAt(i + 1);
        if (low >= 0xdc00 && low <= 0xdfff) {
          cp = (code - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
          i += 1;
        }
      }
      ascii += mapCodePoint(cp);
    }
  }

  // Trailing dots go, as callers remove them from `hostname`.
  let end = ascii.length;
  while (end > 1 && ascii.charCodeAt(end - 1) === 46 /* '.' */) {
    end -= 1;
  }
  return isIp(ascii.slice(0, end));
}

/**
 * For a host ending in a number without being an IP address in ASCII: `null`,
 * unless it holds non-ASCII characters, which browsers may map (see
 * `isMappedIp`).
 */
function isNonAsciiIp(hostname: string): boolean | null {
  for (let i = 0; i < hostname.length; i += 1) {
    if (hostname.charCodeAt(i) >= 128) {
      return isMappedIp(hostname);
    }
  }
  return null;
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
    return isIpv6(hostname);
  }

  // An IPv4 address ends with a number: a last label only made of decimal
  // digits, or of "0x" followed by hexadecimal digits. An IPv6 address ending
  // with an IPv4 one ends with a number too.
  // https://url.spec.whatwg.org/#ends-in-a-number-checker
  if (
    (i === decimal && i !== last && (code === 46 /* '.' */ || i === -1)) ||
    ((code | 32) === 120 /* 'x' */ &&
      hostname.charCodeAt(i - 1) === 48 /* '0' */ &&
      (i === 1 || hostname.charCodeAt(i - 2) === 46)) /* '.' */
  ) {
    return isIpv4(hostname) || isIpv6(hostname) ? true : isNonAsciiIp(hostname);
  }

  // A non-ASCII character right before the digits ending `hostname`, or one
  // or two characters before their "x", may be one that browsers map to a
  // digit or a dot, or delete: `hostname` may end in a number for them.
  return code >= 128 ||
    ((code | 32) === 120 /* 'x' */ &&
      (hostname.charCodeAt(i - 1) >= 128 || hostname.charCodeAt(i - 2) >= 128))
    ? isMappedIp(hostname)
    : false;
}
