import * as tld from '../lib/index';
import isIp from '../lib/is-ip';
import parse from '../lib/parsers/publicsuffix-org';

function repeat(str: string, n: number): string {
  let res = '';
  for (let i = 0; i < n; i += 1) {
    res += str;
  }
  return res;
}

describe('tld.js', () => {
  describe('Constructor', () => {
    it('should export bound methods', () => {
      const getDomain = tld.getDomain;
      const domain = 'fr.google.com';

      expect(tld.getDomain(domain)).toEqual(getDomain(domain));
    });
  });

  describe('#isValidHostname', () => {
    // That's a 255 characters long hostname
    let maxSizeHostname = 'a';
    for (let i = 0; i < 127; i += 1) {
      maxSizeHostname += '.a';
    }

    it('should detect valid hostname', () => {
      expect(tld.isValidHostname('')).toEqual(false);
      expect(tld.isValidHostname('-google.com')).toEqual(false);
      expect(tld.isValidHostname('google-.com')).toEqual(false);
      expect(tld.isValidHostname('google.com-')).toEqual(false);
      expect(tld.isValidHostname('.google.com')).toEqual(false);
      expect(tld.isValidHostname('google..com')).toEqual(false);
      expect(tld.isValidHostname('google.com..')).toEqual(false);
      expect(tld.isValidHostname('example.' + repeat('a', 64) + '.')).toEqual(false);
      expect(tld.isValidHostname('example.' + repeat('a', 64))).toEqual(false);
      expect(tld.isValidHostname('googl@.com..')).toEqual(false);

      // Length of 256 (too long)
      expect(tld.isValidHostname(maxSizeHostname + 'a')).toEqual(false);

      expect(tld.isValidHostname('google.com')).toEqual(true);
      expect(tld.isValidHostname('miam.google.com')).toEqual(true);
      expect(tld.isValidHostname('miam.miam.google.com')).toEqual(true);
      expect(tld.isValidHostname('example.' + repeat('a', 63) + '.')).toEqual(true);
      expect(tld.isValidHostname('example.' + repeat('a', 63))).toEqual(true);

      // Acceps domains with '_' (validation is not strict by default)
      expect(tld.isValidHostname('foo.bar_baz.com')).toEqual(true);
      expect(tld.isValidHostname('foo.bar_baz.com', { strictHostnameValidation: true })).toEqual(false);

      // @see https://github.com/oncletom/tld.js/issues/95
      expect(tld.isValidHostname('miam.miam.google.com.')).toEqual(true);

      // Length of 255 (maximum allowed)
      expect(tld.isValidHostname(maxSizeHostname)).toEqual(true);

      // Unicode
      expect(tld.isValidHostname('mañana.com')).toEqual(true);
      expect(tld.isValidHostname(String.fromCodePoint(918000) + '.com')).toEqual(false);
    });

    it('should be falsy on invalid domain syntax', () => {
      expect(tld.isValidHostname('.localhost')).toEqual(false);
      expect(tld.isValidHostname('.google.com')).toEqual(false);
      expect(tld.isValidHostname('.com')).toEqual(false);
    });

    it('should accept extra code points in domain with lenien mode', () => {
      // @see https://github.com/oncletom/tld.js/pull/122
      expect(tld.isValidHostname('foo.bar_baz.com', { strictHostnameValidation: false })).toEqual(true);
      expect(tld.isValidHostname('foo.bar_baz.com', { strictHostnameValidation: true })).toEqual(false);
    });
  });

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

  describe('#getDomain', () => {
    it('should return the expected domain from a simple string', () => {
      expect(tld.getDomain('google.com')).toEqual('google.com');
      expect(tld.getDomain('t.co')).toEqual('t.co');
      expect(tld.getDomain('  GOOGLE.COM   ')).toEqual('google.com');
      expect(tld.getDomain('    t.CO    ')).toEqual('t.co');
    });

    it('should return the relevant domain of a two levels domain', () => {
      expect(tld.getDomain('google.co.uk')).toEqual('google.co.uk');
    });

    it('should return the relevant domain from a subdomain string', () => {
      expect(tld.getDomain('fr.google.com')).toEqual('google.com');
      expect(tld.getDomain('foo.google.co.uk')).toEqual('google.co.uk');
      expect(tld.getDomain('fr.t.co')).toEqual('t.co');
    });

    it('should not break on specific RegExp characters', () => {
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/33
        tld.getDomain('www.weir)domain.com');
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tld.getDomain("http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php");
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tld.getDomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.toThrow();
    });

    // @see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', () => {
      const domain = tld.getDomain(
        'http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3',
      );
      expect(domain).toEqual('jsdelivr.net');
    });

    it('should provide consistent results', () => {
      expect(tld.getDomain('www.bl.uk')).toEqual('bl.uk');
      expect(tld.getDomain('www.majestic12.co.uk')).toEqual('majestic12.co.uk');
    });

    // @see https://github.com/oncletom/tld.js/issues/25
    // @see https://github.com/oncletom/tld.js/issues/30
    it('existing rule constraint', () => {
      expect(tld.getDomain('s3.amazonaws.com')).toEqual('amazonaws.com');
      expect(tld.getDomain('s3.amazonaws.com', { allowPrivateDomains: true })).toEqual(null);
      expect(tld.getDomain('blogspot.co.uk', { allowPrivateDomains: true })).toEqual(null);
      expect(tld.getDomain('blogspot.co.uk')).toEqual('blogspot.co.uk');
    });

    it('should return nytimes.com even in a whole valid', () => {
      expect(tld.getDomain('http://www.nytimes.com/')).toEqual('nytimes.com');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(tld.getDomain('https://www.google.co.uk./maps')).toEqual('google.co.uk');
    });
  });

  describe('#getPublicSuffix', () => {
    describe('allowPrivateDomains', () => {
      const getPublicSuffix = (url: string) => {
        return tld.getPublicSuffix(url, { allowPrivateDomains: true });
      };

      it('should return co.uk if google.co.uk', () => {
        expect(getPublicSuffix('google.co.uk')).toEqual('co.uk');
      });

      // @see https://github.com/oncletom/tld.js/pull/97
      it('should return www.ck if www.www.ck', () => {
        expect(getPublicSuffix('www.www.ck')).toEqual('ck');
      });

      // @see https://github.com/oncletom/tld.js/issues/30
      it('should return s3.amazonaws.com if s3.amazonaws.com', () => {
        expect(getPublicSuffix('s3.amazonaws.com')).toEqual('s3.amazonaws.com');
      });

      it('should return s3.amazonaws.com if www.s3.amazonaws.com', () => {
        expect(getPublicSuffix('www.s3.amazonaws.com')).toEqual('s3.amazonaws.com');
      });

      it('should directly return the suffix if it matches a rule key', () => {
        expect(getPublicSuffix('youtube')).toEqual('youtube');
      });

      it('should return the suffix if a rule exists that has no exceptions', () => {
        expect(getPublicSuffix('microsoft.eu')).toEqual('eu');
      });

      // @see https://github.com/oncletom/tld.js/pull/97
      it('should return the string TLD if the publicsuffix does not exist', () => {
        expect(getPublicSuffix('www.freedom.nsa')).toEqual('nsa');
      });

      // @see https://github.com/oncletom/tld.js/issues/95
      it('should ignore the trailing dot in a domain', () => {
        expect(getPublicSuffix('https://www.google.co.uk./maps')).toEqual('co.uk');
      });
    });

    describe('ignoring Private domains', () => {
      const getPublicSuffix = (url: string) => {
        return tld.getPublicSuffix(url, { allowPrivateDomains: false });
      };

      it('should return com if www.s3.amazonaws.com', () => {
        expect(getPublicSuffix('www.s3.amazonaws.com')).toEqual('com');
      });

      it('should return net if global.prod.fastly.net', () => {
        expect(getPublicSuffix('https://global.prod.fastly.net')).toEqual('net');
      });

      it('should return co.uk if google.co.uk', () => {
        expect(getPublicSuffix('google.co.uk')).toEqual('co.uk');
      });
    });

    describe('ignoring ICANN domains', () => {
      const getPublicSuffix = (url: string) => {
        return tld.getPublicSuffix(url, { allowIcannDomains: false, allowPrivateDomains: true });
      };

      it('should return s3.amazonaws.com if www.s3.amazonaws.com', () => {
        expect(getPublicSuffix('www.s3.amazonaws.com')).toEqual('s3.amazonaws.com');
      });

      it('should return global.prod.fastly.net if global.prod.fastly.net', () => {
        expect(getPublicSuffix('https://global.prod.fastly.net')).toEqual('global.prod.fastly.net');
      });

      it('should return co.uk if google.co.uk', () => {
        expect(getPublicSuffix('google.co.uk')).toEqual('uk');
      });
    });
  });

  describe('#getHostname', () => {
    it('should return a valid hostname as is', () => {
      expect(tld.getHostname(' example.CO.uk ')).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less URL', () => {
      expect(tld.getHostname('example.co.uk/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + port URL', () => {
      expect(tld.getHostname('example.co.uk:8080/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication URL', () => {
      expect(tld.getHostname('user:password@example.co.uk/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless URL', () => {
      expect(tld.getHostname('user@example.co.uk/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication + port URL', () => {
      expect(tld.getHostname('user:password@example.co.uk:8080/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless + port URL', () => {
      expect(tld.getHostname('user@example.co.uk:8080/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a user-password same-scheme URL', () => {
      expect(tld.getHostname('//user:password@example.co.uk:8080/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a passwordless same-scheme URL', () => {
      expect(tld.getHostname('//user@example.co.uk:8080/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a complex user-password scheme URL', () => {
      expect(tld.getHostname('git+ssh://user:password@example.co.uk:8080/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should return the hostname of a complex passwordless scheme URL', () => {
      expect(tld.getHostname('git+ssh://user@example.co.uk:8080/some/path?and&query#hash')).toEqual('example.co.uk');
    });

    // it('should return the initial value if it is not a valid hostname', () => {
    //   expect(tld.getHostname(42)).toEqual('42');
    // });

    it('should return www.nytimes.com even with an URL as a parameter', () => {
      expect(tld.getHostname('http://www.nytimes.com/glogin?URI=http://www.notnytimes.com/2010/03/26/us/politics/26court.html&OQ=_rQ3D1Q26&OP=45263736Q2FKgi!KQ7Dr!K@@@Ko!fQ24KJg(Q3FQ5Cgg!Q60KQ60W.WKWQ22KQ60IKyQ3FKigQ24Q26!Q26(Q3FKQ60I(gyQ5C!Q2Ao!fQ24')).toEqual('www.nytimes.com');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(tld.getHostname('http://example.co.uk./some/path?and&query#hash')).toEqual('example.co.uk');
    });

    it('should handle fragment URL', () => {
      expect(tld.getHostname('http://example.co.uk.#hash')).toEqual('example.co.uk');
    });

    it('should handle parameter URL', () => {
      expect(tld.getHostname('http://example.co.uk.?and&query#hash')).toEqual('example.co.uk');
    });

    it('should detect invalid protocol characters', () => {
      expect(tld.getHostname('ht~tp://example.co.uk.')).toEqual(null);
    });

    it('should reject incomplete ipv6', () => {
      expect(tld.getHostname('http://[::1')).toEqual(null);
    });

    describe('should handle unicode domains', () => {
      for (let code = 917760; code < 918000; code += 1) {
        it('accepts code: ' + code, () => {
          const hostname = String.fromCodePoint(code) + '.com';
          expect(tld.getHostname(hostname)).toEqual(hostname);
        });
      }
    });
  });

  describe('getSubdomain method', () => {
    it('should return null if the domain cannot be found', () => {
      expect(tld.getSubdomain('not-a-validHost')).toEqual(null);
    });

    it('should return the relevant subdomain of a hostname', () => {
      expect(tld.getSubdomain('localhost')).toEqual(null);
      expect(tld.getSubdomain('google.com')).toEqual('');
      expect(tld.getSubdomain('fr.google.com')).toEqual('fr');
      expect(tld.getSubdomain('random.fr.google.com')).toEqual('random.fr');
      expect(tld.getSubdomain('my.custom.domain')).toEqual('my');
    });

    it('should return the relevant subdomain of a badly trimmed string', () => {
      expect(tld.getSubdomain(' google.COM')).toEqual('');
      expect(tld.getSubdomain('   fr.GOOGLE.COM ')).toEqual('fr');
      expect(tld.getSubdomain(' random.FR.google.com')).toEqual('random.fr');
    });

    it('should return the subdomain of a TLD + SLD hostname', () => {
      expect(tld.getSubdomain('love.fukushima.jp')).toEqual('');
      expect(tld.getSubdomain('i.love.fukushima.jp')).toEqual('i');
      expect(tld.getSubdomain('random.nuclear.strike.co.jp')).toEqual('random.nuclear');
    });

    it('should return the subdomain of a wildcard hostname', () => {
      expect(tld.getSubdomain('google.co.uk')).toEqual('');
      expect(tld.getSubdomain('fr.google.co.uk')).toEqual('fr');
      expect(tld.getSubdomain('random.fr.google.co.uk')).toEqual('random.fr');
    });

    // @see https://github.com/oncletom/tld.js/issues/25
    it.skip('should return the subdomain of reserved subdomains', () => {
      expect(tld.getSubdomain('blogspot.co.uk')).toEqual('');
      expect(tld.getSubdomain('emergency.blogspot.co.uk')).toEqual('emergency');
    });

    it('should not break on specific RegExp characters', () => {
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/33
        tld.getSubdomain('www.weir)domain.com');
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tld.getSubdomain("http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php");
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tld.getSubdomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.toThrow();
    });

    // @see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', () => {
      const domain = tld.getSubdomain('http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3');
      expect(domain).toEqual('cdn');
    });

    // @see https://github.com/oncletom/tld.js/issues/35
    it('should provide consistent results', () => {
      expect(tld.getSubdomain('www.bl.uk')).toEqual('www');
      expect(tld.getSubdomain('www.majestic12.co.uk')).toEqual('www');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(tld.getSubdomain('random.fr.google.co.uk.')).toEqual('random.fr');
    });
  });

  describe('#parse', () => {
    const mockResponse = (host: string) => {
      return {
        domain: null,
        host,
        isIcann: null,
        isIp: true,
        isPrivate: null,
        isValid: true,
        publicSuffix: null,
        subdomain: null,
      };
    };

    it('should handle ipv6 addresses properly', () => {
      expect(tld.parse('http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).toEqual(
        mockResponse('2001:0db8:85a3:0000:0000:8a2e:0370:7334'),
      );
      expect(tld.parse('http://user:pass@[::1]/segment/index.html?query#frag')).toEqual(
        mockResponse('::1'),
      );
      expect(tld.parse('https://[::1]')).toEqual(
        mockResponse('::1'),
      );
      expect(tld.parse('http://[1080::8:800:200C:417A]/foo')).toEqual(
        mockResponse('1080::8:800:200c:417a'),
      );
    });

    it('should handle ipv4 addresses properly', () => {
      expect(tld.parse('http://192.168.0.1/')).toEqual(
        mockResponse('192.168.0.1'),
      );
    });
  });

  describe('validHosts', () => {
    describe('non-empty array', () => {
      const options = {
        validHosts: ['localhost'],
      };

      it('should now be a valid host', () => {
        expect(tld.isValidHostname('localhost', options)).toEqual(true);
      });

      it('should return the known valid host', () => {
        expect(tld.getDomain('localhost', options)).toEqual('localhost');
        expect(tld.getDomain('subdomain.localhost', options)).toEqual('localhost');
        expect(tld.getDomain('subdomain.notlocalhost', options)).toEqual('subdomain.notlocalhost');
        expect(tld.getDomain('subdomain.not-localhost', options)).toEqual('subdomain.not-localhost');
      });

      // @see https://github.com/oncletom/tld.js/issues/66
      it('should return the subdomain of a validHost', () => {
        expect(tld.getSubdomain('vhost.localhost', options)).toEqual('vhost');
      });

      it('should fallback to normal extraction if no match in validHost', () => {
        expect(tld.getSubdomain('vhost.evil.com', options)).toEqual('vhost');
      });
    });
  });

  describe('SuffixTrie', () => {
    it('should ignore empty line', () => {
      const tlds = parse('\n');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({});
    });

    it('should ignore comment', () => {
      const tlds = parse('// \n');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({});
    });

    it('should parse up to the first space', () => {
      const tlds = parse('co.uk .evil');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({ uk: { co: { $: 1 } } });
    });

    it('should parse normal rule', () => {
      const tlds = parse('co.uk');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({ uk: { co: { $: 1 } } });
    });

    it('should parse exception', () => {
      const tlds = parse('!co.uk');
      expect(tlds.exceptions).toEqual({ uk: { co: { $: 1 } } });
      expect(tlds.rules).toEqual({});
    });

    it('should parse wildcard', () => {
      const options = {
        allowIcannDomains: true,
        allowPrivateDomains: false,
      };
      let tlds = parse('*');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({ '*': { $: 1 } });
      expect(tlds.suffixLookup('foo', options).publicSuffix).toEqual('foo');

      tlds = parse('*.uk');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({ uk: { '*': { $: 1 } } });
      expect(tlds.suffixLookup('bar.uk', options).publicSuffix).toEqual('bar.uk');
      expect(tlds.suffixLookup('bar.baz', options)).toEqual(null);

      tlds = parse('foo.*.baz');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({ baz: { '*': { foo: { $: 1 } } } });
      expect(tlds.suffixLookup('foo.bar.baz', options).publicSuffix).toEqual('foo.bar.baz');
      expect(tlds.suffixLookup('foo.foo.bar', options)).toEqual(null);
      expect(tlds.suffixLookup('bar.foo.baz', options)).toEqual(null);
      expect(tlds.suffixLookup('foo.baz', options)).toEqual(null);
      expect(tlds.suffixLookup('baz', options)).toEqual(null);

      tlds = parse('foo.bar.*');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({ '*': { bar: { foo: { $: 1 } } } });
      expect(tlds.suffixLookup('foo.bar.baz', options).publicSuffix).toEqual('foo.bar.baz');
      expect(tlds.suffixLookup('foo.foo.bar', options)).toEqual(null);

      tlds = parse('foo.*.*');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({ '*': { '*': { foo: { $: 1 } } } });
      expect(tlds.suffixLookup('foo.bar.baz', options).publicSuffix).toEqual('foo.bar.baz');
      expect(tlds.suffixLookup('foo.foo.bar', options).publicSuffix).toEqual('foo.foo.bar');
      expect(tlds.suffixLookup('baz.foo.bar', options)).toEqual(null);

      tlds = parse('fo.bar.*\nfoo.bar.baz');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({
        '*': {
          bar: { fo: { $: 1 } },
        },
        'baz': {
          bar: { foo: { $: 1 } },
        },
      });
      expect(tlds.suffixLookup('foo.bar.baz', options).publicSuffix).toEqual('foo.bar.baz');

      tlds = parse('bar.*\nfoo.bar.baz');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({
        '*': {
          bar: { $: 1 },
        },
        'baz': {
          bar: { foo: { $: 1 } },
        },
      });
      expect(tlds.suffixLookup('foo.bar.baz', options).publicSuffix).toEqual('foo.bar.baz');
    });

    it('should insert rules with same TLD', () => {
      const tlds = parse('co.uk\nca.uk');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({
        uk: {
          ca: { $: 1 },
          co: { $: 1 },
        },
      });
    });

    it('should parse puny-encoded rules', () => {
      const tlds = parse('xn--maana-pta.xn----dqo34k.com');
      expect(tlds.exceptions).toEqual({});
      expect(tlds.rules).toEqual({
        com: {
          '☃-⌘': {
            mañana: { $: 1 },
          },
        },
      });
    });

    it('should make the distinction between Private and ICANN', () => {
      const tlds = parse([
        'co.uk',
        '// comment',
        '// ===BEGIN PRIVATE DOMAINS===',
        'ca.ul',
        '!foo.bar',
      ].join('\n'));
      expect(tlds.exceptions).toEqual({ bar: { foo: { $: 2 } } });
      expect(tlds.rules).toEqual({
        uk: { co: { $: 1 } },
        ul: { ca: { $: 2 } },
      });
    });
  });
});
