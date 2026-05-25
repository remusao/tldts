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
  });

  it('should return true on valid ip addresses', () => {
    expect(isIp('::1')).to.equal(true);
    expect(isIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.equal(true);
    expect(isIp('192.168.0.1')).to.equal(true);
    expect(isIp('[::1]')).to.equal(true);
    expect(isIp('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).to.equal(true);
  });

  it('should return false on invalid ip addresses', () => {
    expect(isIp('::1-')).to.equal(false);
    expect(isIp('192.168.0.1.')).to.equal(false);
    expect(isIp('192.168.0')).to.equal(false);
    expect(isIp('192.168.0.')).to.equal(false);
    expect(isIp('192.16-8.0.1')).to.equal(false);
    // Too long for IPv4 (length > 15)
    expect(isIp('255.255.255.2555')).to.equal(false);
    // Too long for IPv6 (length > 39)
    expect(isIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334:1234')).to.equal(
      false,
    );
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
