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
    expect(isValidHostname('.google.com')).to.equal(false);
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

    // @see https://github.com/oncletom/tld.js/issues/95
    expect(isValidHostname('miam.miam.google.com.')).to.equal(true);

    // Length of 255 (maximum allowed)
    expect(isValidHostname(maxSizeHostname)).to.equal(true);

    // Unicode
    expect(isValidHostname('mañana.com')).to.equal(true);
  });

  it('should be falsy on invalid domain syntax', () => {
    expect(isValidHostname('.localhost')).to.equal(false);
    expect(isValidHostname('.google.com')).to.equal(false);
    expect(isValidHostname('.com')).to.equal(false);
  });

  it('should accept extra code points in domain (not strict)', () => {
    // @see https://github.com/oncletom/tld.js/pull/122
    expect(isValidHostname('foo.bar_baz.com')).to.equal(true);
  });
});
