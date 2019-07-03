export default function test(tldts: any): void {
  describe('from https://github.com/rushmorem/publicsuffix/blob/master/src/tests.rs', () => {
    // Copyright (c) 2016 Rushmore Mushambi
    it('should allow parsing IDN email addresses', () => {
      expect(tldts.parse('Pelé@example.com')).toMatchObject({
        domain: 'example.com',
        hostname: 'example.com',
        publicSuffix: 'com',
      });

      expect(tldts.parse('δοκιμή@παράδειγμα.δοκιμή')).toMatchObject({
        domain: 'παράδειγμα.δοκιμή',
        hostname: 'παράδειγμα.δοκιμή',
        publicSuffix: 'δοκιμή',
      });

      expect(tldts.parse('我買@屋企.香港')).toMatchObject({
        domain: '屋企.香港',
        hostname: '屋企.香港',
        publicSuffix: '香港',
      });

      expect(tldts.parse('甲斐@黒川.日本')).toMatchObject({
        domain: '黒川.日本',
        hostname: '黒川.日本',
        publicSuffix: '日本',
      });

      expect(tldts.parse('чебурашка@ящик-с-апельсинами.рф')).toMatchObject({
        domain: 'ящик-с-апельсинами.рф',
        hostname: 'ящик-с-апельсинами.рф',
        publicSuffix: 'рф',
      });

      expect(tldts.parse('用户@例子.广告')).toMatchObject({
        domain: '例子.广告',
        hostname: '例子.广告',
        publicSuffix: '广告',
      });
    });
  });

  describe('#getDomain', () => {
    it('should allow disabling parsing/validation of hostnames', () => {
      expect(
        tldts.getDomain('foo.com', {
          extractHostname: false,
        }),
      ).toEqual('foo.com');
    });

    describe('supports reserved keywords', () => {
      [
        'abstract',
        'arguments',
        'await',
        'boolean',
        'break',
        'byte',
        'case',
        'catch',
        'char',
        'class',
        'const',
        'continue',
        'debugger',
        'default',
        'delete',
        'do',
        'double',
        'else',
        'enum',
        'eval',
        'export',
        'extends',
        'false',
        'final',
        'finally',
        'float',
        'for',
        'function',
        'goto',
        'if',
        'implements',
        'import',
        'in',
        'instanceof',
        'int',
        'interface',
        'let',
        'long',
        'native',
        'new',
        'null',
        'package',
        'private',
        'protected',
        'public',
        'return',
        'short',
        'static',
        'super',
        'switch',
        'synchronized',
        'this',
        'throw',
        'throws',
        'transient',
        'true',
        'try',
        'typeof',
        'var',
        'void',
        'volatile',
        'while',
        'with',
        'yield',
      ].forEach(keyword => {
        it(keyword, () => {
          expect(tldts.getDomain(`https://${keyword}.com`)).toEqual(
            `${keyword}.com`,
          );
          expect(tldts.getDomain(`https://foo.${keyword}.com`)).toEqual(
            `${keyword}.com`,
          );
          expect(tldts.getDomain(`https://foo.${keyword}`)).toEqual(
            `foo.${keyword}`,
          );
        });
      });
    });

    it('handle IPs', () => {
      expect(tldts.getDomain('1.2.3.4')).toEqual(null);
      expect(tldts.getHostname('1.2.3.4')).toEqual('1.2.3.4');
    });

    it('handle weird urls', () => {
      expect(tldts.getDomain('  ftp:/mapasamazonsa.com.ve./  ')).toEqual(
        'mapasamazonsa.com.ve',
      );
      expect(tldts.getDomain('  ftp://///mapasamazonsa.com.ve./  ')).toEqual(
        'mapasamazonsa.com.ve',
      );
      expect(tldts.getDomain('  ftp://///mapasamazonsa.com.ve/  ')).toEqual(
        'mapasamazonsa.com.ve',
      );
      expect(tldts.getDomain('ftp://///mapasamazonsa.com.ve/')).toEqual(
        'mapasamazonsa.com.ve',
      );

      // From https://github.com/peerigon/parse-domain/issues/49
      expect(tldts.getDomain('ftp://mapasamazonsa.com.ve/')).toEqual(
        'mapasamazonsa.com.ve',
      );
      expect(
        tldts.getDomain('http://y399.3466633.be:4/235222/399.html'),
      ).toEqual('3466633.be');
      expect(tldts.getDomain('this%20file%20was%')).toEqual(null);
      expect(
        tldts.getDomain(
          'wss://ie14.zopim.com/s/W/ws/zPYsGUAnWMyJ1XOL/c/1537265376519',
        ),
      ).toEqual('zopim.com');
      expect(tldts.getDomain('wss://mp.sparkchess.com/ ')).toEqual(
        'sparkchess.com',
      );
      expect(
        tldts.getDomain(
          'wss://119.92.223.221.prod.hosts.ooklaserver.net:8080/ws',
        ),
      ).toEqual('ooklaserver.net');
      expect(
        tldts.getDomain(
          'wss://gscspeedtest1.dctechmicro.com.prod.hosts.ooklaserver.net:8080/ws',
        ),
      ).toEqual('ooklaserver.net');
      expect(
        tldts.getDomain('ws://lhg2-speedtest.globe.com.ph:8080/ws'),
      ).toEqual('globe.com.ph');
      expect(
        tldts.getDomain('wss://s-usc1c-nss-218.firebaseio.com/.ws'),
      ).toEqual('firebaseio.com');
      expect(tldts.getDomain('http://server.dr.pt./')).toEqual('dr.pt');
    });

    it('should return the expected domain from a simple string', () => {
      expect(tldts.getDomain('google.com')).toEqual('google.com');
      expect(tldts.getDomain('t.co')).toEqual('t.co');
      expect(tldts.getDomain('  GOOGLE.COM   ')).toEqual('google.com');
      expect(tldts.getDomain('    t.CO    ')).toEqual('t.co');
    });

    it('should return the relevant domain of a two levels domain', () => {
      expect(tldts.getDomain('google.co.uk')).toEqual('google.co.uk');
    });

    it('should return the relevant domain from a subdomain string', () => {
      expect(tldts.getDomain('fr.google.com')).toEqual('google.com');
      expect(tldts.getDomain('foo.google.co.uk')).toEqual('google.co.uk');
      expect(tldts.getDomain('fr.t.co')).toEqual('t.co');
    });

    it('should handle domains with lots of subdomains', () => {
      expect(tldts.getDomain('a.f.g.h.i.bar.baz.google.com')).toEqual(
        'google.com',
      );
      expect(tldts.getDomain('foo.bar.baz.fr.t.co')).toEqual('t.co');
      expect(tldts.getDomain('sub.sub2.foo.bar.baz.fr.t.co')).toEqual('t.co');
    });

    it('should not break on specific RegExp characters', () => {
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/33
        tldts.getDomain('www.weir)domain.com');
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getDomain(
          "http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php",
        );
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getDomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.toThrow();
    });

    // @see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', () => {
      const domain = tldts.getDomain(
        'http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3',
      );
      expect(domain).toEqual('jsdelivr.net');
    });

    it('should provide consistent results', () => {
      expect(tldts.getDomain('www.bl.uk')).toEqual('bl.uk');
      expect(tldts.getDomain('www.majestic12.co.uk')).toEqual(
        'majestic12.co.uk',
      );
    });

    // @see https://github.com/oncletom/tld.js/issues/25
    // @see https://github.com/oncletom/tld.js/issues/30
    it('existing rule constraint', () => {
      expect(tldts.getDomain('s3.amazonaws.com')).toEqual('amazonaws.com');
      expect(
        tldts.getDomain('s3.amazonaws.com', { allowPrivateDomains: true }),
      ).toEqual(null);
      expect(
        tldts.getDomain('blogspot.co.uk', { allowPrivateDomains: true }),
      ).toEqual(null);
      expect(tldts.getDomain('blogspot.co.uk')).toEqual('blogspot.co.uk');
    });

    it('should return nytimes.com even in a whole valid', () => {
      expect(tldts.getDomain('http://www.nytimes.com/')).toEqual('nytimes.com');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(tldts.getDomain('https://www.google.co.uk./maps')).toEqual(
        'google.co.uk',
      );
    });
  });

  describe('#getPublicSuffix', () => {
    describe('allowPrivateDomains', () => {
      const getPublicSuffix = (url: string) => {
        return tldts.getPublicSuffix(url, { allowPrivateDomains: true });
      };

      it('should return de if example.de', () => {
        expect(getPublicSuffix('example.de')).toEqual('de');
      });

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
        expect(getPublicSuffix('www.s3.amazonaws.com')).toEqual(
          's3.amazonaws.com',
        );
      });

      it('should directly return the suffix if it matches a rule key', () => {
        expect(getPublicSuffix('youtube')).toEqual('youtube');
      });

      it('should return the suffix if a rule exists that has no exceptions', () => {
        expect(getPublicSuffix('microsoft.eu')).toEqual('eu');
      });

      // @see https://github.com/oncletom/tld.js/pull/97
      it('should return the string tldts if the publicsuffix does not exist', () => {
        expect(getPublicSuffix('www.freedom.nsa')).toEqual('nsa');
      });

      // @see https://github.com/oncletom/tld.js/issues/95
      it('should ignore the trailing dot in a domain', () => {
        expect(getPublicSuffix('https://www.google.co.uk./maps')).toEqual(
          'co.uk',
        );
      });
    });

    describe('ignoring Private domains', () => {
      const getPublicSuffix = (url: string) => {
        return tldts.getPublicSuffix(url, { allowPrivateDomains: false });
      };

      it('should return de if example.de', () => {
        expect(getPublicSuffix('example.de')).toEqual('de');
        expect(getPublicSuffix('example.foo.de')).toEqual('de');
      });

      it('should return de if example.gov', () => {
        expect(getPublicSuffix('example.gov')).toEqual('gov');
        expect(getPublicSuffix('example.foo.gov')).toEqual('gov');
      });

      it('should return de if example.edu', () => {
        expect(getPublicSuffix('example.edu')).toEqual('edu');
        expect(getPublicSuffix('example.foo.edu')).toEqual('edu');
      });

      it('should return de if example.org', () => {
        expect(getPublicSuffix('example.org')).toEqual('org');
        expect(getPublicSuffix('example.foo.org')).toEqual('org');
      });

      it('should return com if www.s3.amazonaws.com', () => {
        expect(getPublicSuffix('www.s3.amazonaws.com')).toEqual('com');
      });

      it('should return net if global.prod.fastly.net', () => {
        expect(getPublicSuffix('https://global.prod.fastly.net')).toEqual(
          'net',
        );
      });

      it('should return co.uk if google.co.uk', () => {
        expect(getPublicSuffix('google.co.uk')).toEqual('co.uk');
      });
    });

    describe('ignoring ICANN domains', () => {
      const getPublicSuffix = (url: string) => {
        return tldts.getPublicSuffix(url, {
          allowIcannDomains: false,
          allowPrivateDomains: true,
        });
      };

      it('should return s3.amazonaws.com if www.s3.amazonaws.com', () => {
        expect(getPublicSuffix('www.s3.amazonaws.com')).toEqual(
          's3.amazonaws.com',
        );
      });

      it('should return global.prod.fastly.net if global.prod.fastly.net', () => {
        expect(getPublicSuffix('https://global.prod.fastly.net')).toEqual(
          'global.prod.fastly.net',
        );
      });

      it('should return co.uk if google.co.uk', () => {
        expect(getPublicSuffix('google.co.uk')).toEqual('uk');
      });
    });
  });

  describe('#getHostname', () => {
    it('handles space only inputs', () => {
      expect(tldts.getHostname(' ')).toEqual('');
      expect(tldts.getHostname('  ')).toEqual('');
    });

    it('handles space corner-cases', () => {
      expect(tldts.getHostname(' a')).toEqual('a');
      expect(tldts.getHostname('a ')).toEqual('a');
      expect(tldts.getHostname(' a ')).toEqual('a');
      expect(tldts.getHostname(' a  ')).toEqual('a');
    });

    it('should return a valid hostname as is', () => {
      expect(tldts.getHostname(' example.CO.uk ')).toEqual('example.co.uk');
      expect(tldts.getHostname('  example.CO.uk ')).toEqual('example.co.uk');
      expect(tldts.getHostname('  example.CO.uk  ')).toEqual('example.co.uk');
    });

    it('should strip trailing dots', () => {
      expect(tldts.getHostname('example.co.uk.')).toEqual('example.co.uk');
      expect(tldts.getHostname('example.co.uk..')).toEqual('example.co.uk');
      expect(tldts.getHostname('example.co.uk...')).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less URL', () => {
      expect(
        tldts.getHostname('example.co.uk/some/path?and&query#hash'),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + port URL', () => {
      expect(
        tldts.getHostname('example.co.uk:8080/some/path?and&query#hash'),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication URL', () => {
      expect(
        tldts.getHostname(
          'user:password@example.co.uk/some/path?and&query#hash',
        ),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless URL', () => {
      expect(
        tldts.getHostname('user@example.co.uk/some/path?and&query#hash'),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication + port URL', () => {
      expect(
        tldts.getHostname(
          'user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless + port URL', () => {
      expect(
        tldts.getHostname('user@example.co.uk:8080/some/path?and&query#hash'),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a user-password same-scheme URL', () => {
      expect(
        tldts.getHostname(
          '//user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).toEqual('example.co.uk');
      expect(
        tldts.getHostname(
          '  //user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a passwordless same-scheme URL', () => {
      expect(
        tldts.getHostname('//user@example.co.uk:8080/some/path?and&query#hash'),
      ).toEqual('example.co.uk');
      expect(
        tldts.getHostname(
          '  //user@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a complex user-password scheme URL', () => {
      expect(
        tldts.getHostname(
          'git+ssh://user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).toEqual('example.co.uk');
    });

    it('should return the hostname of a complex passwordless scheme URL', () => {
      expect(
        tldts.getHostname(
          'git+ssh://user@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).toEqual('example.co.uk');
    });

    it('should return www.nytimes.com even with an URL as a parameter', () => {
      expect(
        tldts.getHostname(
          'http://www.nytimes.com/glogin?URI=http://www.notnytimes.com/2010/03/26/us/politics/26court.html&OQ=_rQ3D1Q26&OP=45263736Q2FKgi!KQ7Dr!K@@@Ko!fQ24KJg(Q3FQ5Cgg!Q60KQ60W.WKWQ22KQ60IKyQ3FKigQ24Q26!Q26(Q3FKQ60I(gyQ5C!Q2Ao!fQ24',
        ),
      ).toEqual('www.nytimes.com');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(
        tldts.getHostname('http://example.co.uk./some/path?and&query#hash'),
      ).toEqual('example.co.uk');
    });

    it('should handle fragment URL', () => {
      expect(tldts.getHostname('http://example.co.uk.#hash')).toEqual(
        'example.co.uk',
      );
    });

    it('should handle parameter URL', () => {
      expect(tldts.getHostname('http://example.co.uk.?and&query#hash')).toEqual(
        'example.co.uk',
      );
    });

    it('should detect invalid protocol characters', () => {
      expect(tldts.getHostname('ht~tp://example.co.uk.')).toEqual(null);
    });

    it('should reject incomplete ipv6', () => {
      expect(tldts.getHostname('http://[::1')).toEqual(null);
    });

    it('should allow disabling parsing of hostnames', () => {
      expect(
        tldts.getHostname('http://foo.com', {
          extractHostname: false,
        }),
      ).toEqual('http://foo.com');
    });

    it('should allow disabling validation of hostnames', () => {
      expect(
        tldts.parse('http://f__.._oo.com', {
          validateHostname: true,
        }).hostname,
      ).toBeNull();

      expect(
        tldts.parse('http://f__.._oo.com', {
          validateHostname: false,
        }).hostname,
      ).toEqual('f__.._oo.com');
    });

    it('should allow specifying no mixed inputs', () => {
      const url = 'http://foo.com/baz?param=31';
      expect(tldts.parse(url)).toEqual(
        tldts.parse(url, { mixedInputs: false }),
      );
    });
  });

  describe('getSubdomain method', () => {
    it('should return null if the domain cannot be found', () => {
      expect(tldts.getSubdomain('not-a-validHost')).toEqual(null);
    });

    it('should return the relevant subdomain of a hostname', () => {
      expect(tldts.getSubdomain('localhost')).toEqual(null);
      expect(tldts.getSubdomain('google.com')).toEqual('');
      expect(tldts.getSubdomain('fr.google.com')).toEqual('fr');
      expect(tldts.getSubdomain('random.fr.google.com')).toEqual('random.fr');
      expect(tldts.getSubdomain('my.custom.domain')).toEqual('my');
    });

    it('should return the relevant subdomain of a badly trimmed string', () => {
      expect(tldts.getSubdomain(' google.COM')).toEqual('');
      expect(tldts.getSubdomain('   fr.GOOGLE.COM ')).toEqual('fr');
      expect(tldts.getSubdomain(' random.FR.google.com')).toEqual('random.fr');
    });

    it('should return the subdomain of a tldts + SLD hostname', () => {
      expect(tldts.getSubdomain('love.fukushima.jp')).toEqual('');
      expect(tldts.getSubdomain('i.love.fukushima.jp')).toEqual('i');
      expect(tldts.getSubdomain('random.nuclear.strike.co.jp')).toEqual(
        'random.nuclear',
      );
    });

    it('should return the subdomain of a wildcard hostname', () => {
      expect(tldts.getSubdomain('google.co.uk')).toEqual('');
      expect(tldts.getSubdomain('fr.google.co.uk')).toEqual('fr');
      expect(tldts.getSubdomain('random.fr.google.co.uk')).toEqual('random.fr');
    });

    // @see https://github.com/oncletom/tld.js/issues/25
    it('should return the subdomain of reserved subdomains', () => {
      expect(tldts.getSubdomain('blogspot.co.uk')).toEqual('');
      expect(tldts.getSubdomain('emergency.blogspot.co.uk')).toEqual(
        'emergency',
      );
    });

    it('should not break on specific RegExp characters', () => {
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/33
        tldts.getSubdomain('www.weir)domain.com');
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getSubdomain(
          "http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php",
        );
      }).not.toThrow();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getSubdomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.toThrow();
    });

    // @see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', () => {
      const domain = tldts.getSubdomain(
        'http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3',
      );
      expect(domain).toEqual('cdn');
    });

    // @see https://github.com/oncletom/tld.js/issues/35
    it('should provide consistent results', () => {
      expect(tldts.getSubdomain('www.bl.uk')).toEqual('www');
      expect(tldts.getSubdomain('www.majestic12.co.uk')).toEqual('www');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(tldts.getSubdomain('random.fr.google.co.uk.')).toEqual(
        'random.fr',
      );
    });
  });

  describe('#parse', () => {
    const mockResponse = (hostname: string) => {
      return {
        domain: null,
        hostname,
        isIcann: null,
        isIp: true,
        isPrivate: null,
        publicSuffix: null,
        subdomain: null,
      };
    };

    it('fallback to wildcard', () => {
      expect(tldts.parse('https://foo.bar.badasdasdada')).toEqual({
        domain: 'bar.badasdasdada',
        hostname: 'foo.bar.badasdasdada',
        isIcann: false,
        isIp: false,
        isPrivate: false,
        publicSuffix: 'badasdasdada',
        subdomain: 'foo',
      });
    });

    it('should handle ipv6 addresses properly', () => {
      expect(
        tldts.parse('http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]'),
      ).toEqual(mockResponse('2001:0db8:85a3:0000:0000:8a2e:0370:7334'));
      expect(
        tldts.parse('http://user:pass@[::1]/segment/index.html?query#frag'),
      ).toEqual(mockResponse('::1'));
      expect(tldts.parse('https://[::1]')).toEqual(mockResponse('::1'));
      expect(tldts.parse('http://[1080::8:800:200C:417A]/foo')).toEqual(
        mockResponse('1080::8:800:200c:417a'),
      );
      expect(tldts.parse('http://[1080::8:800:200C:417A]:4242/foo')).toEqual(
        mockResponse('1080::8:800:200c:417a'),
      );
    });

    it('should handle ipv4 addresses properly', () => {
      expect(tldts.parse('http://192.168.0.1/')).toEqual(
        mockResponse('192.168.0.1'),
      );
    });

    it('disable ip detection', () => {
      expect(tldts.parse('http://192.168.0.1/', { detectIp: false })).toEqual({
        domain: '0.1',
        hostname: '192.168.0.1',
        isIcann: false,
        isIp: null,
        isPrivate: false,
        publicSuffix: '1',
        subdomain: '192.168',
      });
    });
  });

  describe('validHosts', () => {
    describe('non-empty array', () => {
      const options = {
        validHosts: ['localhost'],
      };

      it('should return the known valid host', () => {
        expect(tldts.getDomain('localhost', options)).toEqual('localhost');
        expect(tldts.getDomain('subdomain.localhost', options)).toEqual(
          'localhost',
        );
        expect(tldts.getDomain('subdomain.notlocalhost', options)).toEqual(
          'subdomain.notlocalhost',
        );
        expect(tldts.getDomain('subdomain.not-localhost', options)).toEqual(
          'subdomain.not-localhost',
        );
      });

      // @see https://github.com/oncletom/tld.js/issues/66
      it('should return the subdomain of a validHost', () => {
        expect(tldts.getSubdomain('vhost.localhost', options)).toEqual('vhost');
      });

      it('should fallback to normal extraction if no match in validHost', () => {
        expect(tldts.getSubdomain('vhost.evil.com', options)).toEqual('vhost');
      });
    });
  });
}
