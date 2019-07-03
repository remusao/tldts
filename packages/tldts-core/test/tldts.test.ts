import isIp from '../src/is-ip';
import isValidHostname from '../src/is-valid';

function repeat(str: string, n: number): string {
  let res = '';
  for (let i = 0; i < n; i += 1) {
    res += str;
  }
  return res;
}

describe('tld.js', () => {
  describe('#isIp', () => {
    it('should return false on incorrect inputs', () => {
      expect(isIp('')).toEqual(false);
    });

    it('should return true on valid ip addresses', () => {
      expect(isIp('::1')).toEqual(true);
      expect(isIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toEqual(true);
      expect(isIp('192.168.0.1')).toEqual(true);
    });

    it('should return false on invalid ip addresses', () => {
      expect(isIp('::1-')).toEqual(false);
      expect(isIp('[::1]')).toEqual(false);
      expect(isIp('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).toEqual(false);
      expect(isIp('192.168.0.1.')).toEqual(false);
      expect(isIp('192.168.0')).toEqual(false);
      expect(isIp('192.168.0.')).toEqual(false);
      expect(isIp('192.16-8.0.1')).toEqual(false);
    });
  });

  describe('#isValidHostname', () => {
    // That's a 255 characters long hostname
    let maxSizeHostname = 'a';
    for (let i = 0; i < 127; i += 1) {
      maxSizeHostname += '.a';
    }

    it('should detect valid hostname', () => {
      expect(isValidHostname('')).toEqual(false);
      expect(isValidHostname('-google.com')).toEqual(false);
      expect(isValidHostname('google-.com')).toEqual(false);
      expect(isValidHostname('google.com-')).toEqual(false);
      expect(isValidHostname('.google.com')).toEqual(false);
      expect(isValidHostname('google..com')).toEqual(false);
      expect(isValidHostname('google.com..')).toEqual(false);
      expect(isValidHostname('example.' + repeat('a', 64) + '.')).toEqual(
        false,
      );
      expect(isValidHostname('example.' + repeat('a', 64))).toEqual(false);
      expect(isValidHostname('googl@.com..')).toEqual(false);

      // Length of 256 (too long)
      expect(isValidHostname(maxSizeHostname + 'a')).toEqual(false);

      expect(isValidHostname('google.com')).toEqual(true);
      expect(isValidHostname('miam.google.com')).toEqual(true);
      expect(isValidHostname('miam.miam.google.com')).toEqual(true);
      expect(isValidHostname('example.' + repeat('a', 63) + '.')).toEqual(true);
      expect(isValidHostname('example.' + repeat('a', 63))).toEqual(true);

      // Accepts domains with '_' (validation is not strict)
      expect(isValidHostname('foo.bar_baz.com')).toEqual(true);

      // @see https://github.com/oncletom/tld.js/issues/95
      expect(isValidHostname('miam.miam.google.com.')).toEqual(true);

      // Length of 255 (maximum allowed)
      expect(isValidHostname(maxSizeHostname)).toEqual(true);

      // Unicode
      expect(isValidHostname('mañana.com')).toEqual(true);
    });

    it('should be falsy on invalid domain syntax', () => {
      expect(isValidHostname('.localhost')).toEqual(false);
      expect(isValidHostname('.google.com')).toEqual(false);
      expect(isValidHostname('.com')).toEqual(false);
    });

    it('should accept extra code points in domain (not strict)', () => {
      // @see https://github.com/oncletom/tld.js/pull/122
      expect(isValidHostname('foo.bar_baz.com')).toEqual(true);
    });
  });
});
