import { expect } from 'chai';
import 'mocha';

import isIp from '../src/is-ip';
import isValidHostname from '../src/is-valid';

function repeat(str: string, n: number): string {
  let res = '';
  for (let i = 0; i < n; i += 1) {
    res += str;
  }
  return res;
}

describe('#isIp', () => {
  it('should return false on incorrect inputs', () => {
    expect(isIp('')).to.equal(false);
    expect(isIp(':')).to.equal(false);
    expect(isIp('a:')).to.equal(false);
    expect(isIp(':a')).to.equal(false);
  });

  it('should return true on valid ip addresses', () => {
    expect(isIp('::')).to.equal(true);
    expect(isIp('[::]')).to.equal(true);
    expect(isIp('::1')).to.equal(true);
    expect(isIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.equal(true);
    expect(isIp('192.168.0.1')).to.equal(true);
    expect(isIp('[::1]')).to.equal(true);
    expect(isIp('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).to.equal(true);
  });

  it('should return false on invalid ip addresses', () => {
    expect(isIp('::1-')).to.equal(false);
    expect(isIp('192.168.0.1.')).to.equal(false);
    expect(isIp('192.168.0.')).to.equal(false);
    // Too many groups for IPv6
    expect(isIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334:1234')).to.equal(
      false,
    );
  });

  it('accepts every IPv4 notation browsers do', () => {
    for (const ip of [
      '127.1', // 127.0.0.1
      '192.168.0', // 192.168.0.0
      '2130706433', // 127.0.0.1
      '0x7f.0.0.1',
      '0X7F.1',
      '0177.0.0.1', // octal
      '0x', // 0.0.0.0
      '4294967295',
      '1.2.65535',
    ]) {
      expect(isIp(ip), ip).to.equal(true);
    }
  });

  it('accepts IPv6 ending with an IPv4 address', () => {
    for (const ip of [
      '::ffff:127.0.0.1',
      '[::ffff:1.2.3.4]',
      '0000:0000:0000:0000:0000:ffff:255.255.255.255',
      '1:2:3:4:5::1.2.3.4',
    ]) {
      expect(isIp(ip), ip).to.equal(true);
    }
  });

  it('accepts "::" for a single missing group', () => {
    for (const ip of ['1:2:3:4:5:6:7::', '::1:2:3:4:5:6:7', '1::2:3:4:5:6:7']) {
      expect(isIp(ip), ip).to.equal(true);
    }
  });

  it('rejects malformed IPv6', () => {
    for (const ip of [
      ':::::::::', // too many groups
      '::1:2:3:4:5:6:7:8',
      '1:2:3:4:5:6:7::8', // "::" for no group
      'a:b:c', // too few
      '1:2:3:4:5:6:7',
      '12345::', // too many digits
      '1::2::3', // two "::"
      '[::1', // unclosed
      '[]',
    ]) {
      expect(isIp(ip), ip).to.equal(false);
    }

    // Ending in a number, but not with an IPv4 address in the right place.
    for (const ip of [
      '::ffff:256.2.3.4',
      '1:2:3:4:5:1.2.3.4',
      '1:2:3:4:5:6::1.2.3.4',
    ]) {
      expect(isIp(ip), ip).to.equal(null);
    }
  });

  // Browsers read a host ending in a number as an IPv4 address and nothing
  // else: when it is not a valid one, it is no valid host either.
  it('returns null for a host ending in a number which is not an IPv4', () => {
    for (const hostname of [
      '999.999.999.999',
      '1.2.65536',
      '4294967296',
      '1...234',
      '1.2.3.4.5',
      '08.1.1.1', // not octal
      '192.16-8.0.1',
      '255.255.255.2555',
      'example.123',
      'example.0x1f',
      'example.0x',
    ]) {
      expect(isIp(hostname), hostname).to.equal(null);
    }

    // The last label is not a number: a domain name.
    for (const hostname of ['1.2.3.4a', 'example.3com', 'a.0xg', 'a.1f']) {
      expect(isIp(hostname), hostname).to.equal(false);
    }
  });

  // Browsers map some non-ASCII characters to digits, 'a'-'f', 'x' or '.' and
  // delete others before reading a host (UTS #46), so these are addresses too.
  it('reads non-ASCII hosts as browsers do', () => {
    for (const hostname of [
      '１２７.０.０.１', // fullwidth digits
      '127。0。0。1', // ideographic full stops
      '127．0．0．1', // fullwidth full stops
      '127.0.0.1\u200b', // zero-width space, deleted
      '1\u00ad27.0.0.1', // soft hyphen, deleted
      '𝟏𝟐𝟕.𝟎.𝟎.𝟏', // mathematical digits (UTF-16 pairs)
      '①②⑦.0.0.1', // circled digits
      '⑩.0.0.1', // circled number: "10"
      '0ｘ7f.1', // fullwidth 'x'
      '1.0x㍲', // "da"
      '²¹³⁴', // superscripts: 2134
      '127.0.0.1。', // trailing (mapped) dot
    ]) {
      expect(isIp(hostname), hostname).to.equal(true);
    }

    // Ends in a number for browsers without being an IPv4 address.
    for (const hostname of ['example.①', '1.2.3.4.５', 'a.0ｘ', 'é.123']) {
      expect(isIp(hostname), hostname).to.equal(null);
    }

    // Internationalized domain names.
    for (const hostname of [
      'пример.рф',
      'bücher.de',
      '例え.テスト',
      'ａ.ｂ',
      '1.１a',
      'example.\u{1F600}',
      '1.2.3.4\u200d', // zero-width joiner: kept, not a digit
      '1.2.3.℻', // "fax"
      // IPv6 is read as written: mapped characters never make one.
      '::ffff:１２７.０.０.１',
      '::ffff:1.2.3.4\u200b',
      '[::ffff:1.2.3.４]',
    ]) {
      expect(isIp(hostname), hostname).to.equal(false);
    }
  });

  it('agrees with `new URL` on random non-ASCII hosts', () => {
    let seed = 0x2545f491;
    const random = (n: number): number => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) % n;
    };
    const alphabet = '0123456789.xabfg-０１９ｘＸａＦ。．\u00ad\u200b①⑩㍲²éф'
      .split('')
      .concat(['𝟏']); // a UTF-16 pair
    for (let i = 0; i < 50000; i += 1) {
      let host = '';
      for (let length = 1 + random(10); length > 0; length -= 1) {
        host += alphabet[random(alphabet.length)]!;
      }
      let hostname: string | null;
      try {
        hostname = new URL(`http://${host}/`).hostname;
      } catch {
        hostname = null;
      }
      // Callers remove trailing dots first, and all of them where browsers
      // remove one: hosts ending in a dot, or in several ones for browsers, are
      // left aside.
      if (!host.endsWith('.') && !hostname?.endsWith('..')) {
        const ip = hostname !== null && /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
        expect(isIp(host) === true, host).to.equal(ip);
      }
    }
  });

  // Deterministic fuzzing against Node's WHATWG URL parser.
  it('agrees with `new URL` on random address-like hosts', () => {
    let seed = 0x9e3779b9;
    const random = (n: number): number => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) % n;
    };
    const generate = (alphabet: string): string => {
      let host = '';
      for (let length = 1 + random(12); length > 0; length -= 1) {
        host += alphabet.charAt(random(alphabet.length));
      }
      return host;
    };
    // `true` for an IP address, `false` for a domain, `null` if invalid.
    const whatwg = (host: string): boolean | null => {
      try {
        return /^\[|^[0-9.]+$/.test(new URL(`http://${host}/`).hostname);
      } catch {
        return null;
      }
    };

    for (let i = 0; i < 50000; i += 1) {
      const ipv4 = generate('0123456789.....xXaAfF78');
      if (!ipv4.endsWith('.')) {
        expect(isIp(ipv4), ipv4).to.equal(whatwg(ipv4));
      }

      let ipv6 = generate('0123456789abcdefAF::::::...');
      if (i % 2 === 1) {
        // Whole groups, to reach eight of them and IPv4 endings.
        const groups = ['', '', '0', 'fFff', '12345', '1.2.3.4', '1.2.3.256'];
        ipv6 = groups[random(groups.length)]!;
        for (let n = random(10); n > 0; n -= 1) {
          ipv6 += ':' + groups[random(groups.length)]!;
        }
      }
      const isIpv6 = whatwg(`[${ipv6}]`) === true;
      expect(isIp(`[${ipv6}]`) === true, ipv6).to.equal(isIpv6);
      if (ipv6.includes(':')) {
        expect(isIp(ipv6) === true, ipv6).to.equal(isIpv6); // optional brackets
      }
    }
  });

  // RFC 4291 §2.2: an IPv6 hextet is "one to four hexadecimal digits", i.e.
  // 0-9 / a-f / A-F (case-insensitive). Letters g-z and G-Z are NOT hex digits,
  // so a label containing them is not an IPv6 literal. The uppercase branch is
  // only reachable via `extractHostname: false` (extraction lowercases, and
  // isValidHostname rejects uppercase on the fast path), but isIp must still
  // classify it correctly. https://www.rfc-editor.org/rfc/rfc4291#section-2.2
  it('should only accept hex digits (a-f/A-F) in IPv6 labels (RFC 4291 §2.2)', () => {
    // Uppercase A-F are valid hex and must keep matching (guards the 'F' bound).
    expect(isIp('2001:DB8::F')).to.equal(true);
    expect(isIp('FACE:B00C::1')).to.equal(true);
    // 'G' (just past 'F') and 'Z' are not hex digits => not an IPv6 literal.
    expect(isIp('2001:DB8::G')).to.equal(false);
    expect(isIp('Z::Z')).to.equal(false);
    // Lowercase 'g' was already rejected before the fix — regression guard.
    expect(isIp('2001:db8::g')).to.equal(false);
    // The rule also applies inside brackets (stripped before the check).
    expect(isIp('[2001:DB8::G]')).to.equal(false);
  });
});

describe('#isValidHostname', () => {
  // That's a 255 characters long hostname
  let maxSizeHostname = 'a';
  for (let i = 0; i < 127; i += 1) {
    maxSizeHostname += '.a';
  }

  it('should detect valid hostname', () => {
    expect(isValidHostname('')).to.equal(false);
    expect(isValidHostname('-google.com')).to.equal(false);
    expect(isValidHostname('google-.com')).to.equal(false);
    expect(isValidHostname('google.com-')).to.equal(false);
    expect(isValidHostname('.google.com')).to.equal(true);
    expect(isValidHostname('google..com')).to.equal(false);
    expect(isValidHostname('google.com..')).to.equal(false);
    expect(isValidHostname('example.' + repeat('a', 64) + '.')).to.equal(false);
    expect(isValidHostname('example.' + repeat('a', 64))).to.equal(false);
    expect(isValidHostname('googl@.com..')).to.equal(false);

    // Length of 256 (too long)
    expect(isValidHostname(maxSizeHostname + 'a')).to.equal(false);

    expect(isValidHostname('google.com')).to.equal(true);
    expect(isValidHostname('miam.google.com')).to.equal(true);
    expect(isValidHostname('miam.miam.google.com')).to.equal(true);
    expect(isValidHostname('example.' + repeat('a', 63) + '.')).to.equal(true);
    expect(isValidHostname('example.' + repeat('a', 63))).to.equal(true);

    // Accepts domains with '_' (validation is not strict)
    expect(isValidHostname('foo.bar_baz.com')).to.equal(true);

    // A label may END with '_' (DNS/SPF), not just start/contain it — RFC 2181 §11.
    expect(isValidHostname('spf_.google.com')).to.equal(true); // trailing '_', non-final label (reported bug)
    expect(isValidHostname('foo_.bar_.com')).to.equal(true); // trailing '_' on consecutive labels
    expect(isValidHostname('_.google.com')).to.equal(true); // label consisting solely of '_'
    expect(isValidHostname('google.spf_')).to.equal(true); // trailing '_' on the final label (already valid; pins the symmetry)

    // @see https://github.com/oncletom/tld.js/issues/95
    expect(isValidHostname('miam.miam.google.com.')).to.equal(true);

    // Length of 255 (maximum allowed)
    expect(isValidHostname(maxSizeHostname)).to.equal(true);

    // Unicode
    expect(isValidHostname('mañana.com')).to.equal(true);
  });

  it('should allow leading dots', () => {
    expect(isValidHostname('.localhost')).to.equal(true);
    expect(isValidHostname('.google.com')).to.equal(true);
    expect(isValidHostname('.com')).to.equal(true);
  });

  it('should reject labels that begin with a hyphen', () => {
    // A label must not start with '-' (RFC 1034 §3.5 / RFC 1035 §2.3.1 LDH; cf.
    // UTS #46 CheckHyphens). The first label was already rejected ('-google.com');
    // these pin the same rule for interior and final labels. @see issue #2395
    expect(isValidHostname('foo.-example.com')).to.equal(false); // interior label
    expect(isValidHostname('foo.-com')).to.equal(false); // final label
    expect(isValidHostname('a.b.-c.com')).to.equal(false); // deeper interior label
    expect(isValidHostname('.-foo.com')).to.equal(false); // leading dot, then hyphen-label
    expect(isValidHostname('a.--b.com')).to.equal(false); // label starting with '--'
    expect(isValidHostname('a.-.b.com')).to.equal(false); // single-'-' label

    // Only the FIRST char of a label decides: '-_' starts with '-' (invalid),
    // '_-' starts with '_' (valid).
    expect(isValidHostname('a.-_b.com')).to.equal(false);
    expect(isValidHostname('a._-b.com')).to.equal(true);

    // Underscore-leading labels (DKIM/DMARC/SRV), leading dots and interior
    // hyphens stay valid — and the rule must NOT touch punycode/IDN labels,
    // whose interior '--' is legitimate.
    expect(isValidHostname('_dmarc.example.com')).to.equal(true);
    expect(isValidHostname('_sip._tcp.example.com')).to.equal(true);
    expect(isValidHostname('foo._bar.com')).to.equal(true);
    expect(isValidHostname('.google.com')).to.equal(true);
    expect(isValidHostname('foo.ex-ample.com')).to.equal(true);
    expect(isValidHostname('xn--mnchen-3ya.de')).to.equal(true); // IDN label with '--'
    expect(isValidHostname('a.xn--p1ai')).to.equal(true); // punycode TLD
  });

  it('should accept extra code points in domain (not strict)', () => {
    // @see https://github.com/oncletom/tld.js/pull/122
    expect(isValidHostname('foo.bar_baz.com')).to.equal(true);
  });
});
