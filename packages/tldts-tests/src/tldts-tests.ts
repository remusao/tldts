import { expect } from 'chai';
import 'mocha';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import { loadPublicSuffixList, parsePublicSuffixRules } from 'tldts-utils';

/**
 * A single entry of the WHATWG URL test data (web-platform-tests). Entries are
 * either a comment string or a parsed-result object.
 */
interface WhatwgUrlTestCase {
  input: string;
  base?: string | null;
  hostname?: string;
  protocol?: string;
  failure?: boolean;
}

/** Locate a repo fixture whether tests run from `src` (ts-node) or `dist`. */
function resolveFixture(relativePath: string): string {
  let dir = __dirname;
  while (!existsSync(resolve(dir, relativePath)) && dir !== dirname(dir)) {
    dir = dirname(dir);
  }
  return resolve(dir, relativePath);
}

/** True if `value` contains any non-ASCII (> U+007F) code unit. */
function containsNonAscii(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    if (value.charCodeAt(i) > 127) {
      return true;
    }
  }
  return false;
}

/**
 * WHATWG URL test data, vendored verbatim from web-platform-tests:
 * https://github.com/web-platform-tests/wpt/blob/258f285de043b79e44324228c0fd800b38d21879/url/resources/urltestdata.json
 * Re-pin by re-downloading url/resources/urltestdata.json from that repo.
 */
const WHATWG_URL_TEST_DATA = JSON.parse(
  readFileSync(
    resolveFixture('packages/tldts-tests/src/data/urltestdata.json'),
    'utf-8',
  ),
) as (string | WhatwgUrlTestCase)[];

interface Options {
  extractHostname?: boolean;
  allowPrivateDomains?: boolean;
  allowIcannDomains?: boolean;
  validateHostname?: boolean;
  mixedInputs?: boolean;
  detectIp?: boolean;
  detectSpecialUse?: boolean;
  validHosts?: string[];
}

export default function test(
  tldts: {
    getDomainWithoutSuffix: (url: string, options?: Options) => string | null;
    getPublicSuffix: (url: string, options?: Options) => string | null;
    getHostname: (url: string, options?: Options) => string | null;
    getDomain: (url: string, options?: Options) => string | null;
    getSubdomain: (url: string, options?: Options) => string | null;
    parse: (
      url: string,
      options?: Options,
    ) => {
      domain: string | null;
      hostname: string | null;
      publicSuffix: string | null;
      isSpecialUse?: boolean | null;
    };
  },
  { includePrivate }: { includePrivate: boolean },
): void {
  describe('from https://github.com/rushmorem/publicsuffix/blob/master/src/tests.rs', () => {
    // Copyright (c) 2016 Rushmore Mushambi
    it('should allow parsing IDN email addresses', () => {
      expect(tldts.parse('Pelé@example.com')).to.deep.include({
        domain: 'example.com',
        hostname: 'example.com',
        publicSuffix: 'com',
      });

      expect(tldts.parse('δοκιμή@παράδειγμα.δοκιμή')).to.deep.include({
        domain: 'παράδειγμα.δοκιμή',
        hostname: 'παράδειγμα.δοκιμή',
        publicSuffix: 'δοκιμή',
      });

      expect(tldts.parse('我買@屋企.香港')).to.deep.include({
        domain: '屋企.香港',
        hostname: '屋企.香港',
        publicSuffix: '香港',
      });

      expect(tldts.parse('甲斐@黒川.日本')).to.deep.include({
        domain: '黒川.日本',
        hostname: '黒川.日本',
        publicSuffix: '日本',
      });

      expect(tldts.parse('чебурашка@ящик-с-апельсинами.рф')).to.deep.include({
        domain: 'ящик-с-апельсинами.рф',
        hostname: 'ящик-с-апельсинами.рф',
        publicSuffix: 'рф',
      });

      expect(tldts.parse('用户@例子.广告')).to.deep.include({
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
      ).to.equal('foo.com');
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
        // Object.prototype-member labels (lowercase, so they survive hostname
        // lowercasing): must be treated as ordinary labels, never resolve
        // against the prototype chain during trie traversal.
        'constructor',
        '__proto__',
      ].forEach((keyword) => {
        it(keyword, () => {
          expect(tldts.getDomain(`https://${keyword}.com`)).to.equal(
            `${keyword}.com`,
          );
          expect(tldts.getDomain(`https://foo.${keyword}.com`)).to.equal(
            `${keyword}.com`,
          );
          expect(tldts.getDomain(`https://foo.${keyword}`)).to.equal(
            `foo.${keyword}`,
          );
        });
      });
    });

    it('handle IPs', () => {
      expect(tldts.getDomain('1.2.3.4')).to.equal(null);
      expect(tldts.getHostname('1.2.3.4')).to.equal('1.2.3.4');
    });

    it('handle weird urls', () => {
      expect(tldts.getDomain('  ftp:/mapasamazonsa.com.ve./  ')).to.equal(
        'mapasamazonsa.com.ve',
      );
      expect(tldts.getDomain('  ftp://///mapasamazonsa.com.ve./  ')).to.equal(
        'mapasamazonsa.com.ve',
      );
      expect(tldts.getDomain('  ftp://///mapasamazonsa.com.ve/  ')).to.equal(
        'mapasamazonsa.com.ve',
      );
      expect(tldts.getDomain('ftp://///mapasamazonsa.com.ve/')).to.equal(
        'mapasamazonsa.com.ve',
      );

      // From https://github.com/peerigon/parse-domain/issues/49
      expect(tldts.getDomain('ftp://mapasamazonsa.com.ve/')).to.equal(
        'mapasamazonsa.com.ve',
      );
      expect(
        tldts.getDomain('http://y399.3466633.be:4/235222/399.html'),
      ).to.equal('3466633.be');
      expect(tldts.getDomain('this%20file%20was%')).to.equal(null);
      expect(
        tldts.getDomain(
          'wss://ie14.zopim.com/s/W/ws/zPYsGUAnWMyJ1XOL/c/1537265376519',
        ),
      ).to.equal('zopim.com');
      expect(tldts.getDomain('wss://mp.sparkchess.com/ ')).to.equal(
        'sparkchess.com',
      );
      expect(
        tldts.getDomain(
          'wss://119.92.223.221.prod.hosts.ooklaserver.net:8080/ws',
        ),
      ).to.equal('ooklaserver.net');
      expect(
        tldts.getDomain(
          'wss://gscspeedtest1.dctechmicro.com.prod.hosts.ooklaserver.net:8080/ws',
        ),
      ).to.equal('ooklaserver.net');
      expect(
        tldts.getDomain('ws://lhg2-speedtest.globe.com.ph:8080/ws'),
      ).to.equal('globe.com.ph');
      expect(
        tldts.getDomain('wss://s-usc1c-nss-218.firebaseio.com/.ws'),
      ).to.equal('firebaseio.com');
      expect(tldts.getDomain('http://server.dr.pt./')).to.equal('dr.pt');
    });

    it('should return the expected domain from a simple string', () => {
      expect(tldts.getDomain('google.com')).to.equal('google.com');
      expect(tldts.getDomain('t.co')).to.equal('t.co');
      expect(tldts.getDomain('  GOOGLE.COM   ')).to.equal('google.com');
      expect(tldts.getDomain('    t.CO    ')).to.equal('t.co');
    });

    it('should return the relevant domain of a two levels domain', () => {
      expect(tldts.getDomain('google.co.uk')).to.equal('google.co.uk');
    });

    it('should return the relevant domain from a subdomain string', () => {
      expect(tldts.getDomain('fr.google.com')).to.equal('google.com');
      expect(tldts.getDomain('foo.google.co.uk')).to.equal('google.co.uk');
      expect(tldts.getDomain('fr.t.co')).to.equal('t.co');
    });

    it('should handle domains with lots of subdomains', () => {
      expect(tldts.getDomain('a.f.g.h.i.bar.baz.google.com')).to.equal(
        'google.com',
      );
      expect(tldts.getDomain('foo.bar.baz.fr.t.co')).to.equal('t.co');
      expect(tldts.getDomain('sub.sub2.foo.bar.baz.fr.t.co')).to.equal('t.co');
    });

    it('should not break on specific RegExp characters', () => {
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/33
        tldts.getDomain('www.weir)domain.com');
      }).not.to.throw();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getDomain(
          "http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php",
        );
      }).not.to.throw();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getDomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.to.throw();
    });

    // See https://github.com/remusao/tldts/issues/1523
    it('should accept leading dots in a domain', () => {
      expect(
        tldts.getDomain('http://.example.co.uk./some/path?and&query#hash'),
      ).to.equal('example.co.uk');
    });

    // See https://github.com/remusao/tldts/issues/1534
    it('should accept leading dash and underscores in a domain', () => {
      expect(
        tldts.parse(
          '_0f6879f07aa61fc09d9645cce98b30e3.bsg-1418.bryanjswift.com',
        ),
      ).to.eql({
        domain: 'bryanjswift.com',
        domainWithoutSuffix: 'bryanjswift',
        hostname: '_0f6879f07aa61fc09d9645cce98b30e3.bsg-1418.bryanjswift.com',
        isIcann: true,
        isIp: false,
        isPrivate: false,
        isSpecialUse: null,
        publicSuffix: 'com',
        subdomain: '_0f6879f07aa61fc09d9645cce98b30e3.bsg-1418',
      });

      expect(tldts.parse('_bsg-1418.bryanjswift.com')).to.eql({
        domain: 'bryanjswift.com',
        domainWithoutSuffix: 'bryanjswift',
        hostname: '_bsg-1418.bryanjswift.com',
        isIcann: true,
        isIp: false,
        isPrivate: false,
        isSpecialUse: null,
        publicSuffix: 'com',
        subdomain: '_bsg-1418',
      });

      expect(tldts.parse('_bryanjswift.com')).to.eql({
        domain: '_bryanjswift.com',
        domainWithoutSuffix: '_bryanjswift',
        hostname: '_bryanjswift.com',
        isIcann: true,
        isIp: false,
        isPrivate: false,
        isSpecialUse: null,
        publicSuffix: 'com',
        subdomain: '',
      });
    });

    // Labels ending with '_' (e.g. SPF / DNS-TXT records). Allowed by DNS (RFC 2181 §11)
    // and WHATWG URL ('_' is not a forbidden host code point); only the RFC 1035 LDH
    // "preferred syntax" forbids it, which tldts intentionally does not enforce.
    it('should accept labels ending with an underscore', () => {
      expect(tldts.getDomain('spf_.google.com')).to.equal('google.com'); // reported bug
      expect(tldts.getHostname('spf_.google.com')).to.equal('spf_.google.com'); // full hostname preserved
      expect(tldts.getDomain('_spf.google.com')).to.equal('google.com'); // leading '_' (reference case)
      expect(tldts.getDomain('s_pf.google.com')).to.equal('google.com'); // middle '_' (reference case)
    });

    // @see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', () => {
      const domain = tldts.getDomain(
        'http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3',
      );
      expect(domain).to.equal('jsdelivr.net');
    });

    it('should provide consistent results', () => {
      expect(tldts.getDomain('www.bl.uk')).to.equal('bl.uk');
      expect(tldts.getDomain('www.majestic12.co.uk')).to.equal(
        'majestic12.co.uk',
      );
    });

    // @see https://github.com/oncletom/tld.js/issues/25
    // @see https://github.com/oncletom/tld.js/issues/30
    if (includePrivate) {
      it('existing rule constraint', () => {
        expect(tldts.getDomain('s3.amazonaws.com')).to.equal('amazonaws.com');
        expect(
          tldts.getDomain('s3.amazonaws.com', { allowPrivateDomains: true }),
        ).to.equal(null);
        // Removed: https://github.com/publicsuffix/list/pull/2327
        // expect(
        //   tldts.getDomain('blogspot.co.uk', { allowPrivateDomains: true }),
        // ).to.equal(null);
        // expect(tldts.getDomain('blogspot.co.uk')).to.equal('blogspot.co.uk');
      });
    }

    it('should return nytimes.com even in a whole valid', () => {
      expect(tldts.getDomain('http://www.nytimes.com/')).to.equal(
        'nytimes.com',
      );
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(tldts.getDomain('https://www.google.co.uk./maps')).to.equal(
        'google.co.uk',
      );
    });
  });

  describe('#getPublicSuffix', () => {
    if (includePrivate) {
      describe('allowPrivateDomains', () => {
        const getPublicSuffix = (url: string) => {
          return tldts.getPublicSuffix(url, { allowPrivateDomains: true });
        };

        it('should return de if example.de', () => {
          expect(getPublicSuffix('example.de')).to.equal('de');
        });

        it('should return co.uk if google.co.uk', () => {
          expect(getPublicSuffix('google.co.uk')).to.equal('co.uk');
        });

        // @see https://github.com/oncletom/tld.js/pull/97
        it('should return www.ck if www.www.ck', () => {
          expect(getPublicSuffix('www.www.ck')).to.equal('ck');
        });

        // @see https://github.com/oncletom/tld.js/issues/30
        it('should return s3.amazonaws.com if s3.amazonaws.com', () => {
          expect(getPublicSuffix('s3.amazonaws.com')).to.equal(
            's3.amazonaws.com',
          );
        });

        it('should return s3.amazonaws.com if www.s3.amazonaws.com', () => {
          expect(getPublicSuffix('www.s3.amazonaws.com')).to.equal(
            's3.amazonaws.com',
          );
        });

        it('should directly return the suffix if it matches a rule key', () => {
          expect(getPublicSuffix('youtube')).to.equal('youtube');
        });

        it('should return the suffix if a rule exists that has no exceptions', () => {
          expect(getPublicSuffix('microsoft.eu')).to.equal('eu');
        });

        // @see https://github.com/oncletom/tld.js/pull/97
        it('should return the string tldts if the publicsuffix does not exist', () => {
          expect(getPublicSuffix('www.freedom.nsa')).to.equal('nsa');
        });

        // @see https://github.com/oncletom/tld.js/issues/95
        it('should ignore the trailing dot in a domain', () => {
          expect(getPublicSuffix('https://www.google.co.uk./maps')).to.equal(
            'co.uk',
          );
        });
      });
    }

    describe('ignoring Private domains', () => {
      const getPublicSuffix = (url: string) => {
        return tldts.getPublicSuffix(url, { allowPrivateDomains: false });
      };

      it('should return de if example.de', () => {
        expect(getPublicSuffix('example.de')).to.equal('de');
        expect(getPublicSuffix('example.foo.de')).to.equal('de');
      });

      it('should return de if example.gov', () => {
        expect(getPublicSuffix('example.gov')).to.equal('gov');
        expect(getPublicSuffix('example.foo.gov')).to.equal('gov');
      });

      it('should return de if example.edu', () => {
        expect(getPublicSuffix('example.edu')).to.equal('edu');
        expect(getPublicSuffix('example.foo.edu')).to.equal('edu');
      });

      it('should return de if example.org', () => {
        expect(getPublicSuffix('example.org')).to.equal('org');
        expect(getPublicSuffix('example.foo.org')).to.equal('org');
      });

      it('should return com if www.s3.amazonaws.com', () => {
        expect(getPublicSuffix('www.s3.amazonaws.com')).to.equal('com');
      });

      it('should return net if global.prod.fastly.net', () => {
        expect(getPublicSuffix('https://global.prod.fastly.net')).to.equal(
          'net',
        );
      });

      it('should return co.uk if google.co.uk', () => {
        expect(getPublicSuffix('google.co.uk')).to.equal('co.uk');
      });
    });

    if (includePrivate) {
      describe('ignoring ICANN domains', () => {
        const getPublicSuffix = (url: string) => {
          return tldts.getPublicSuffix(url, {
            allowIcannDomains: false,
            allowPrivateDomains: true,
          });
        };

        it('should return s3.amazonaws.com if www.s3.amazonaws.com', () => {
          expect(getPublicSuffix('www.s3.amazonaws.com')).to.equal(
            's3.amazonaws.com',
          );
        });

        it('should return global.prod.fastly.net if global.prod.fastly.net', () => {
          expect(getPublicSuffix('https://global.prod.fastly.net')).to.equal(
            'global.prod.fastly.net',
          );
        });

        it('should return co.uk if google.co.uk', () => {
          expect(getPublicSuffix('google.co.uk')).to.equal('uk');
        });
      });
    }
  });

  describe('#getHostname', () => {
    it('handles space only inputs', () => {
      expect(tldts.getHostname(' ')).to.equal(null);
      expect(tldts.getHostname('  ')).to.equal(null);
    });

    it('handles space corner-cases', () => {
      expect(tldts.getHostname(' a')).to.equal('a');
      expect(tldts.getHostname('a ')).to.equal('a');
      expect(tldts.getHostname(' a ')).to.equal('a');
      expect(tldts.getHostname(' a  ')).to.equal('a');
    });

    it('should return a valid hostname as is', () => {
      expect(tldts.getHostname(' example.CO.uk ')).to.equal('example.co.uk');
      expect(tldts.getHostname('  example.CO.uk ')).to.equal('example.co.uk');
      expect(tldts.getHostname('  example.CO.uk  ')).to.equal('example.co.uk');
    });

    it('should strip trailing dots', () => {
      expect(tldts.getHostname('example.co.uk.')).to.equal('example.co.uk');
      expect(tldts.getHostname('example.co.uk..')).to.equal('example.co.uk');
      expect(tldts.getHostname('example.co.uk...')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less URL', () => {
      expect(
        tldts.getHostname('example.co.uk/some/path?and&query#hash'),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + port URL', () => {
      expect(
        tldts.getHostname('example.co.uk:8080/some/path?and&query#hash'),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication URL', () => {
      expect(
        tldts.getHostname(
          'user:password@example.co.uk/some/path?and&query#hash',
        ),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless URL', () => {
      expect(
        tldts.getHostname('user@example.co.uk/some/path?and&query#hash'),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication + port URL', () => {
      expect(
        tldts.getHostname(
          'user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless + port URL', () => {
      expect(
        tldts.getHostname('user@example.co.uk:8080/some/path?and&query#hash'),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a user-password same-scheme URL', () => {
      expect(
        tldts.getHostname(
          '//user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).to.equal('example.co.uk');
      expect(
        tldts.getHostname(
          '  //user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a passwordless same-scheme URL', () => {
      expect(
        tldts.getHostname('//user@example.co.uk:8080/some/path?and&query#hash'),
      ).to.equal('example.co.uk');
      expect(
        tldts.getHostname(
          '  //user@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a complex user-password scheme URL', () => {
      expect(
        tldts.getHostname(
          'git+ssh://user:password@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).to.equal('example.co.uk');
    });

    it('should return the hostname of a complex passwordless scheme URL', () => {
      expect(
        tldts.getHostname(
          'git+ssh://user@example.co.uk:8080/some/path?and&query#hash',
        ),
      ).to.equal('example.co.uk');
    });

    it('should return www.nytimes.com even with an URL as a parameter', () => {
      expect(
        tldts.getHostname(
          'http://www.nytimes.com/glogin?URI=http://www.notnytimes.com/2010/03/26/us/politics/26court.html&OQ=_rQ3D1Q26&OP=45263736Q2FKgi!KQ7Dr!K@@@Ko!fQ24KJg(Q3FQ5Cgg!Q60KQ60W.WKWQ22KQ60IKyQ3FKigQ24Q26!Q26(Q3FKQ60I(gyQ5C!Q2Ao!fQ24',
        ),
      ).to.equal('www.nytimes.com');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(
        tldts.getHostname('http://example.co.uk./some/path?and&query#hash'),
      ).to.equal('example.co.uk');
    });

    // See https://github.com/remusao/tldts/issues/1523
    it('should accept leading dots in a hostname', () => {
      expect(
        tldts.getHostname('http://.example.co.uk./some/path?and&query#hash'),
      ).to.equal('.example.co.uk');
    });

    it('should handle fragment URL', () => {
      expect(tldts.getHostname('http://example.co.uk.#hash')).to.equal(
        'example.co.uk',
      );
    });

    it('should handle parameter URL', () => {
      expect(
        tldts.getHostname('http://example.co.uk.?and&query#hash'),
      ).to.equal('example.co.uk');
    });

    it('should detect invalid protocol characters', () => {
      expect(tldts.getHostname('ht~tp://example.co.uk.')).to.equal(null);
    });

    it('should reject incomplete ipv6', () => {
      expect(tldts.getHostname('http://[::1')).to.equal(null);
    });

    it('should allow disabling parsing of hostnames', () => {
      expect(
        tldts.getHostname('http://foo.com', {
          extractHostname: false,
        }),
      ).to.equal('http://foo.com');
    });

    it('should allow disabling validation of hostnames', () => {
      expect(
        tldts.parse('http://f__.._oo.com', {
          validateHostname: true,
        }).hostname,
      ).to.equal(null);

      expect(
        tldts.parse('http://f__.._oo.com', {
          validateHostname: false,
        }).hostname,
      ).to.equal('f__.._oo.com');
    });

    it('should allow specifying no mixed inputs', () => {
      const url = 'http://foo.com/baz?param=31';
      expect(tldts.parse(url)).to.deep.equal(
        tldts.parse(url, { mixedInputs: false }),
      );
    });

    // https://github.com/remusao/tldts/issues/2258
    it('should be consistent with parse method', () => {
      const url = '___id___.c.mystat-in.net';

      // Underscores (incl. trailing) are accepted — DNS allows any octet (RFC 2181 §11),
      // WHATWG URL does not forbid '_'. parse() and getHostname() must agree.
      expect(tldts.parse(url).hostname).to.equal(url);
      expect(tldts.getHostname(url)).to.equal(url);

      // Without validation
      expect(tldts.parse(url, { validateHostname: false }).hostname).to.equal(
        url,
      );
      expect(tldts.getHostname(url, { validateHostname: false })).to.equal(url);
    });
  });

  describe('getDomainWithoutSuffix method', () => {
    it('should return null if the domain cannot be found', () => {
      expect(tldts.getDomainWithoutSuffix('not-a-validHost')).to.equal(null);
    });

    it('should return null if domain and suffix are the same', () => {
      expect(tldts.getDomainWithoutSuffix('co.uk')).to.equal(null);
    });

    it('should return domain without suffix if domain exists', () => {
      expect(tldts.getDomainWithoutSuffix('https://sub.foo.co.uk')).to.equal(
        'foo',
      );
    });
  });

  describe('getSubdomain method', () => {
    it('should return null if the domain cannot be found', () => {
      expect(tldts.getSubdomain('not-a-validHost')).to.equal(null);
    });

    it('should return the relevant subdomain of a hostname', () => {
      expect(tldts.getSubdomain('localhost')).to.equal(null);
      expect(tldts.getSubdomain('google.com')).to.equal('');
      expect(tldts.getSubdomain('fr.google.com')).to.equal('fr');
      expect(tldts.getSubdomain('random.fr.google.com')).to.equal('random.fr');
      expect(tldts.getSubdomain('my.custom.domain')).to.equal('my');
    });

    it('should return the relevant subdomain of a badly trimmed string', () => {
      expect(tldts.getSubdomain(' google.COM')).to.equal('');
      expect(tldts.getSubdomain('   fr.GOOGLE.COM ')).to.equal('fr');
      expect(tldts.getSubdomain(' random.FR.google.com')).to.equal('random.fr');
    });

    it('should return the subdomain of a tldts + SLD hostname', () => {
      expect(tldts.getSubdomain('love.fukushima.jp')).to.equal('');
      expect(tldts.getSubdomain('i.love.fukushima.jp')).to.equal('i');
      expect(tldts.getSubdomain('random.nuclear.strike.co.jp')).to.equal(
        'random.nuclear',
      );
    });

    it('should return the subdomain of a wildcard hostname', () => {
      expect(tldts.getSubdomain('google.co.uk')).to.equal('');
      expect(tldts.getSubdomain('fr.google.co.uk')).to.equal('fr');
      expect(tldts.getSubdomain('random.fr.google.co.uk')).to.equal(
        'random.fr',
      );
    });

    // @see https://github.com/oncletom/tld.js/issues/25
    // Removed: https://github.com/publicsuffix/list/pull/2327
    // it('should return the subdomain of reserved subdomains', () => {
    //   expect(tldts.getSubdomain('blogspot.co.uk')).to.equal('');
    //   expect(tldts.getSubdomain('emergency.blogspot.co.uk')).to.equal(
    //     'emergency',
    //   );
    // });

    it('should not break on specific RegExp characters', () => {
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/33
        tldts.getSubdomain('www.weir)domain.com');
      }).not.to.throw();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getSubdomain(
          "http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php",
        );
      }).not.to.throw();
      expect(() => {
        // @see https://github.com/oncletom/tld.js/issues/53
        tldts.getSubdomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.to.throw();
    });

    // @see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', () => {
      const domain = tldts.getSubdomain(
        'http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3',
      );
      expect(domain).to.equal('cdn');
    });

    // @see https://github.com/oncletom/tld.js/issues/35
    it('should provide consistent results', () => {
      expect(tldts.getSubdomain('www.bl.uk')).to.equal('www');
      expect(tldts.getSubdomain('www.majestic12.co.uk')).to.equal('www');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', () => {
      expect(tldts.getSubdomain('random.fr.google.co.uk.')).to.equal(
        'random.fr',
      );
    });
  });

  describe('#parse', () => {
    const mockResponse = (hostname: string | null) => {
      return {
        domain: null,
        domainWithoutSuffix: null,
        hostname,
        isIcann: null,
        isIp: true,
        isPrivate: null,
        isSpecialUse: null,
        publicSuffix: null,
        subdomain: null,
      };
    };

    it('fallback to wildcard', () => {
      expect(tldts.parse('https://foo.bar.badasdasdada')).to.deep.equal(
        includePrivate
          ? {
              domain: 'bar.badasdasdada',
              domainWithoutSuffix: 'bar',
              hostname: 'foo.bar.badasdasdada',
              isIcann: false,
              isIp: false,
              isPrivate: false,
              isSpecialUse: null,
              publicSuffix: 'badasdasdada',
              subdomain: 'foo',
            }
          : {
              domain: 'bar.badasdasdada',
              domainWithoutSuffix: 'bar',
              hostname: 'foo.bar.badasdasdada',
              isIcann: null,
              isIp: false,
              isPrivate: null,
              isSpecialUse: null,
              publicSuffix: 'badasdasdada',
              subdomain: 'foo',
            },
      );
    });

    it('should handle data URLs', () => {
      expect(tldts.parse('data:image/png,some-base-64-value')).to.deep.equal({
        ...mockResponse(null),
        isIp: null,
      });
    });

    it('should handle ipv6 addresses properly', () => {
      expect(
        tldts.parse('http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]'),
      ).to.deep.equal(mockResponse('2001:0db8:85a3:0000:0000:8a2e:0370:7334'));
      expect(
        tldts.parse('http://user:pass@[::1]/segment/index.html?query#frag'),
      ).to.deep.equal(mockResponse('::1'));
      expect(tldts.parse('https://[::1]')).to.deep.equal(mockResponse('::1'));
      expect(tldts.parse('http://[1080::8:800:200C:417A]/foo')).to.deep.equal(
        mockResponse('1080::8:800:200c:417a'),
      );
      expect(
        tldts.parse('http://[1080::8:800:200C:417A]:4242/foo'),
      ).to.deep.equal(mockResponse('1080::8:800:200c:417a'));
    });

    it('handles ipv6 address when extractHostname is false', () => {
      const hostname = '1080::8:800:200C:417A';
      expect(tldts.parse(hostname, { extractHostname: false })).to.deep.equal({
        domain: null,
        domainWithoutSuffix: null,
        hostname,
        isIcann: null,
        isIp: true,
        isPrivate: null,
        isSpecialUse: null,
        publicSuffix: null,
        subdomain: null,
      });
    });

    it('handles ipv6 address when extractHostname is false (with brackets)', () => {
      const hostname = '[1080::8:800:200C:417A]';
      expect(tldts.parse(hostname, { extractHostname: false })).to.deep.equal({
        domain: null,
        domainWithoutSuffix: null,
        hostname,
        isIcann: null,
        isIp: true,
        isPrivate: null,
        isSpecialUse: null,
        publicSuffix: null,
        subdomain: null,
      });
    });

    it('should handle ipv4 addresses properly', () => {
      expect(tldts.parse('http://192.168.0.1/')).to.deep.equal(
        mockResponse('192.168.0.1'),
      );
    });

    it('disable ip detection', () => {
      expect(
        tldts.parse('http://192.168.0.1/', { detectIp: false }),
      ).to.deep.equal(
        includePrivate
          ? {
              domain: '0.1',
              domainWithoutSuffix: '0',
              hostname: '192.168.0.1',
              isIcann: false,
              isIp: null,
              isPrivate: false,
              isSpecialUse: null,
              publicSuffix: '1',
              subdomain: '192.168',
            }
          : {
              domain: '0.1',
              domainWithoutSuffix: '0',
              hostname: '192.168.0.1',
              isIcann: null,
              isIp: null,
              isPrivate: null,
              isSpecialUse: null,
              publicSuffix: '1',
              subdomain: '192.168',
            },
      );
    });
  });

  describe('special-use domains (IANA registry)', () => {
    const special = (url: string) =>
      tldts.parse(url, { detectSpecialUse: true }).isSpecialUse;

    it('flags special-use names and their sub-domains', () => {
      for (const hostname of [
        // RFC 6761
        'test',
        'a.b.test',
        'localhost',
        'foo.localhost',
        'invalid',
        'something.invalid',
        'example',
        'sub.example',
        'example.com',
        'example.net',
        'www.example.org',
        // RFC 6762 / 7686 / 9476
        'local',
        'printer.local',
        'onion',
        'facebookcorewwwwi.onion',
        'alt',
        'x.alt',
        // named .arpa entries (RFC 8375 / 8880 / 9462 / 9665 / 9031 / 9965)
        'home.arpa',
        'router.home.arpa',
        'ipv4only.arpa',
        'resolver.arpa',
        'service.arpa',
        '6tisch.arpa',
        'eap.arpa',
        // normalization contract: extractHostname lower-cases the host and
        // strips a trailing dot before isSpecialUse sees it (is-special-use.ts).
        'LocalHost',
        'a.b.test.',
      ]) {
        expect(special(hostname), hostname).to.equal(true);
      }
    });

    it('does not flag ordinary domains, partial matches, or excluded entries', () => {
      for (const hostname of [
        'google.com',
        'foo.bar.com',
        'example.fr', // not a reserved name
        'latest', // label boundary vs `test`
        'notlocalhost', // label boundary vs `localhost`
        'badexample.com', // label boundary vs `example.com`
        'arpa', // only specific .arpa names are reserved
        'foo.arpa',
        'eap-noob.arpa', // deprecated registry entry, intentionally excluded
      ]) {
        expect(special(hostname), hostname).to.equal(false);
      }
    });

    it('is null unless detectSpecialUse is enabled', () => {
      expect(tldts.parse('localhost').isSpecialUse).to.equal(null);
      expect(
        tldts.parse('localhost', { detectSpecialUse: false }).isSpecialUse,
      ).to.equal(null);
      expect(tldts.parse('google.com').isSpecialUse).to.equal(null);
    });
  });

  describe('validHosts', () => {
    describe('non-empty array', () => {
      const options: Options = {
        validHosts: ['localhost'],
      };

      it('should return the known valid host', () => {
        expect(tldts.getDomain('localhost', options)).to.equal('localhost');
        expect(tldts.getDomain('subdomain.localhost', options)).to.equal(
          'localhost',
        );
        expect(tldts.getDomain('subdomain.notlocalhost', options)).to.equal(
          'subdomain.notlocalhost',
        );
        expect(tldts.getDomain('subdomain.not-localhost', options)).to.equal(
          'subdomain.not-localhost',
        );
      });

      // @see https://github.com/oncletom/tld.js/issues/66
      it('should return the subdomain of a validHost', () => {
        expect(tldts.getSubdomain('vhost.localhost', options)).to.equal(
          'vhost',
        );
      });

      it('should fallback to normal extraction if no match in validHost', () => {
        expect(tldts.getSubdomain('vhost.evil.com', options)).to.equal('vhost');
      });
    });
  });

  // Examples based on What-wg specification: https://url.spec.whatwg.org/#example-host-psl
  describe('whatwg URL spec', () => {
    for (const [input, publicSuffix, domain] of includePrivate
      ? ([
          ['com', 'com', null],
          ['example.com', 'com', 'example.com'],
          ['www.example.com', 'com', 'example.com'],
          ['sub.www.example.com', 'com', 'example.com'],
          ['EXAMPLE.COM', 'com', 'example.com'],
          // ['example.com.', 'com.', 'example.com.'],
          ['github.io', 'github.io', null],
          ['whatwg.github.io', 'github.io', 'whatwg.github.io'],
          ['إختبار', 'إختبار', null],
          ['example.إختبار', 'إختبار', 'example.إختبار'],
          ['sub.example.إختبار', 'إختبار', 'example.إختبار'],
          ['[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', null, null],
        ] as const)
      : ([
          ['com', 'com', null],
          ['example.com', 'com', 'example.com'],
          ['www.example.com', 'com', 'example.com'],
          ['sub.www.example.com', 'com', 'example.com'],
          ['EXAMPLE.COM', 'com', 'example.com'],
          // ['example.com.', 'com.', 'example.com.'],
          ['github.io', 'io', 'github.io'],
          ['whatwg.github.io', 'io', 'github.io'],
          ['إختبار', 'إختبار', null],
          ['example.إختبار', 'إختبار', 'example.إختبار'],
          ['sub.example.إختبار', 'إختبار', 'example.إختبار'],
          ['[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', null, null],
        ] as const)) {
      it(input, () => {
        const result = tldts.parse(input, {
          allowPrivateDomains: includePrivate,
        });
        expect(result, input).not.to.equal(null);
        expect(result.publicSuffix, input).to.equal(publicSuffix);
        expect(result.domain, input).to.equal(domain);
      });
    }
  });

  // `getHostname` must pick the same host substring a compliant WHATWG parser
  // would, for tldts' scope. Intentional deviations (no IDNA/IPv4/IPv6
  // normalisation, trailing-dot stripping, lenient host:port/email) are pinned
  // in the "intentional deviations" block below.
  describe('WHATWG URL hostname compliance', () => {
    // --- Web Platform Tests: the browsers' own URL conformance corpus ---
    describe('web-platform-tests url/resources/urltestdata.json', () => {
      const SPECIAL_SCHEME = new Set([
        'ftp:',
        'file:',
        'http:',
        'https:',
        'ws:',
        'wss:',
      ]);

      // In-scope = cases where tldts is expected to match the compliant parser
      // exactly. We exclude representation differences tldts does not perform
      // (IDN/punycode, IPv4 normalisation, IPv6) and inputs that rely on a base
      // URL (tldts has no base concept). `failure` cases are excluded because
      // tldts is best-effort, not strict-reject.
      const inScope = (o: WhatwgUrlTestCase): boolean => {
        if (o.failure) {
          return false;
        }
        const hostname = o.hostname;
        if (typeof hostname !== 'string') {
          return false;
        }
        if (containsNonAscii(o.input)) {
          return false; // non-ASCII input (IDN) — tldts keeps Unicode
        }
        if (hostname.startsWith('xn--')) {
          return false; // punycode output
        }
        if (hostname.startsWith('[')) {
          return false; // IPv6 (tldts strips brackets, does not compress)
        }
        if (o.protocol === 'file:') {
          return false; // file drive-letter / backslash quirks
        }
        if (/^[0-9.]+$/.test(hostname) && !o.input.includes(hostname)) {
          return false; // IPv4 normalisation (e.g. 0x7f.1 -> 127.0.0.1)
        }
        const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*:)\/\//.exec(o.input);
        if (schemeMatch !== null) {
          const scheme = schemeMatch[1];
          return (
            scheme !== undefined && SPECIAL_SCHEME.has(scheme.toLowerCase())
          );
        }
        // Bare input (no scheme, not a path) is only meaningful without a base.
        const bare =
          !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(o.input) &&
          !o.input.startsWith('/');
        return bare && (o.base === null || o.base === undefined);
      };

      // tldts strips trailing dots, and reports "no host" as `null` (not "").
      const expectedHost = (hostname: string): string | null => {
        let host = hostname;
        while (host.length > 0 && host.endsWith('.')) {
          host = host.slice(0, -1);
        }
        return host === '' ? null : host;
      };

      // Documented intentional deviations (NOT boundary bugs): each is an
      // IDNA / percent-decode / shallow-validation difference. Removing an entry
      // once tldts handles it becomes the regression gate.
      const KNOWN_DIVERGENCES = new Set<string>([
        'http://./', // all-dot host: WHATWG collapses empty labels (IDNA); tldts keeps '.'
        'http://../', // idem
        'http://!"$&\'()*+,-.;=_`{}~/', // punctuation host: WHATWG allows, tldts shallow-validation rejects
        'wss://!"$&\'()*+,-.;=_`{}~/', // idem
        'https://a%C2%ADb/', // WHATWG percent-decodes + IDNA-maps the soft hyphen; tldts does neither
      ]);

      for (const entry of WHATWG_URL_TEST_DATA) {
        if (typeof entry === 'string' || !inScope(entry)) {
          continue;
        }
        const { input } = entry;
        if (KNOWN_DIVERGENCES.has(input)) {
          continue;
        }
        const expected = expectedHost(entry.hostname!);
        it(JSON.stringify(input), () => {
          expect(tldts.getHostname(input), input).to.equal(expected);
        });
      }
    });

    // --- Curated boundary cases (the bugs this change fixes) ---
    describe('boundary detection', () => {
      it("treats '\\' as '/' for special schemes", () => {
        // WHATWG host-state: backslash is a host terminator for special URLs.
        expect(tldts.getHostname('https:\\\\example.com\\path')).to.equal(
          'example.com',
        );
      });

      it("does not let a '\\' smuggle the host into userinfo", () => {
        // Security: 'http://example.com\@evil.com' must resolve to example.com,
        // not evil.com (backslash is normalised to '/' before the '@').
        expect(tldts.getHostname('http://example.com\\@evil.com')).to.equal(
          'example.com',
        );
      });

      it('parses a special scheme written without "//"', () => {
        // WHATWG special-authority-slashes state: the authority is parsed even
        // when the "//" is missing.
        expect(tldts.getHostname('https:example.com')).to.equal('example.com');
        expect(tldts.getHostname('http:example.com/foo')).to.equal(
          'example.com',
        );
      });

      it('removes an embedded ASCII tab in the scheme', () => {
        // WHATWG basic parser step 2: tab/newline are removed before parsing.
        expect(tldts.getHostname('htt\tp://example.com/')).to.equal(
          'example.com',
        );
      });

      it('removes an embedded newline / carriage return in the host', () => {
        expect(tldts.getHostname('http://exa\nmple.com/')).to.equal(
          'example.com',
        );
        expect(tldts.getHostname('http://exa\rmple.com/')).to.equal(
          'example.com',
        );
      });

      it('returns null for file:/// (empty authority)', () => {
        // WHATWG file-host state: an empty buffer means an empty host.
        expect(tldts.getHostname('file:///etc/passwd')).to.equal(null);
        expect(tldts.getHostname('file:/etc/passwd')).to.equal(null);
      });

      it('returns the host for file://host/path', () => {
        expect(tldts.getHostname('file://server/share')).to.equal('server');
      });

      it('returns null for opaque (non-special, no "//") schemes', () => {
        // WHATWG opaque-path state: there is no host.
        expect(tldts.getHostname('foo:example.com/bar')).to.equal(null);
        expect(tldts.getHostname('javascript:alert(1)')).to.equal(null);
        expect(tldts.getHostname('urn:isbn:9780307476463')).to.equal(null);
        expect(tldts.getHostname('mailto:example.com')).to.equal(null); // no '@'
      });

      it('extracts the host past an empty userinfo', () => {
        // WHATWG authority-state: 'http://@host' has empty userinfo, host=host.
        expect(tldts.getHostname('http://@example.com')).to.equal(
          'example.com',
        );
      });

      it('lower-cases the scheme when matching (case-insensitive)', () => {
        expect(tldts.getHostname('HTTPS:EXAMPLE.COM')).to.equal('example.com');
      });

      it('recognises every special scheme written without "//"', () => {
        // Exercises the ws / wss / ftp / http / https / file classifier arms.
        expect(tldts.getHostname('ws:example.com')).to.equal('example.com');
        expect(tldts.getHostname('wss:example.com')).to.equal('example.com');
        expect(tldts.getHostname('ftp:example.com')).to.equal('example.com');
        expect(tldts.getHostname('file://h/x')).to.equal('h');
      });

      it('treats look-alike non-special schemes as opaque (no host)', () => {
        // Scheme lengths 1..5 that all fail the special-scheme classifier.
        expect(tldts.getHostname('w:example.com')).to.equal(null);
        expect(tldts.getHostname('wx:example.com')).to.equal(null);
        expect(tldts.getHostname('htu:example.com')).to.equal(null);
        expect(tldts.getHostname('htxp:example.com')).to.equal(null);
        expect(tldts.getHostname('htxps:example.com')).to.equal(null);
      });

      it('keeps a bare host:port (lenient superset)', () => {
        // tldts accepts hostnames, not only URLs; a strict parser treats the
        // left side as a scheme. The "port" must be numeric.
        expect(tldts.getHostname('example.co.uk:8080/p?q#h')).to.equal(
          'example.co.uk',
        );
      });

      it('treats host:<non-numeric-port> as an opaque scheme (=> null)', () => {
        // Documented limit of the host:port heuristic.
        expect(tldts.getHostname('example.com:foo')).to.equal(null);
      });

      it('keeps a scheme-relative reference', () => {
        expect(tldts.getHostname('//user@example.co.uk:8080/x')).to.equal(
          'example.co.uk',
        );
      });
    });

    // --- Intentional deviations, pinned so they cannot change silently ---
    describe('intentional deviations (pinned)', () => {
      it('keeps Unicode hosts (no IDNA/punycode)', () => {
        expect(tldts.getHostname('http://bücher.example/')).to.equal(
          'bücher.example',
        );
      });

      it('keeps the literal IPv4 (no normalisation)', () => {
        expect(tldts.getHostname('http://0x7f.1/')).to.equal('0x7f.1');
      });

      it('returns bracket-less, uncompressed IPv6', () => {
        expect(tldts.getHostname('http://[2001:0DB8::1]:8080/')).to.equal(
          '2001:0db8::1',
        );
      });

      it('strips trailing dots', () => {
        expect(tldts.getHostname('http://example.com./')).to.equal(
          'example.com',
        );
      });

      it('is best-effort on an out-of-range port (WHATWG rejects)', () => {
        expect(tldts.getHostname('http://example.com:99999/')).to.equal(
          'example.com',
        );
      });

      it('extracts the host from an email-like input', () => {
        expect(tldts.getHostname('Pelé@example.com')).to.equal('example.com');
      });

      it('keeps an all-dot host instead of collapsing it (no IDNA)', () => {
        expect(tldts.getHostname('http://./')).to.equal('.');
        expect(tldts.getHostname('http://../')).to.equal('.');
      });

      it('rejects punctuation hosts WHATWG allows (shallow validation)', () => {
        expect(tldts.getHostname('http://!"$&\'()*+,-.;=_`{}~/')).to.equal(
          null,
        );
      });

      it('does not percent-decode the host (no IDNA mapping)', () => {
        expect(tldts.getHostname('https://a%C2%ADb/')).to.equal(null);
      });
    });
  });

  describe('wildcard tests', () => {
    parsePublicSuffixRules(loadPublicSuffixList(), (rule) => {
      if (
        !rule.isException &&
        rule.isWildcard &&
        (rule.isIcann || includePrivate) &&
        rule.rule !== '*.wc.psl.hrsn.dev'
      ) {
        it(rule.rule, () => {
          expect(rule.rule.startsWith('*.')).to.equal(true);
          const domain = rule.rule.slice(2);
          const url = `https://www.sub.${domain}/`;
          const result = tldts.parse(url, {
            allowPrivateDomains: includePrivate,
          });
          expect(result, url).not.to.equal(null);
          expect(result.publicSuffix, url).to.equal(`sub.${domain}`);
          expect(result.domain, url).to.equal(`www.sub.${domain}`);
          expect(result.hostname, url).to.equal(`www.sub.${domain}`);
        });
      }
    });
  });

  describe('exception tests', () => {
    parsePublicSuffixRules(loadPublicSuffixList(), (rule) => {
      if (
        rule.isException &&
        !rule.isWildcard &&
        (rule.isIcann || includePrivate)
      ) {
        const domain = rule.rule;
        it(domain, () => {
          const url = `https://${domain}/`;
          const result = tldts.parse(url, {
            allowPrivateDomains: includePrivate,
          });
          expect(result, url).not.to.equal(null);
          expect(result.publicSuffix, url).to.equal(
            domain.split('.').slice(1).join('.'),
          );
          expect(result.domain, url).to.equal(domain);
          expect(result.hostname, url).to.equal(domain);
        });
      }
    });
  });

  describe('extended tests', () => {
    parsePublicSuffixRules(loadPublicSuffixList(), (rule) => {
      if (
        !rule.isException &&
        !rule.isWildcard &&
        (rule.isIcann || includePrivate)
      ) {
        const suffix = rule.rule;
        it(suffix, () => {
          const url = `https://example.${suffix}/`;
          const result = tldts.parse(url, {
            allowPrivateDomains: includePrivate,
          });
          expect(result, url).not.to.equal(null);
          expect(result.publicSuffix, url).to.equal(suffix);
          expect(result.domain, url).to.equal(`example.${suffix}`);
        });
      }
    });
  });

  describe('options handling (regression for shared default-options reuse)', () => {
    // Calling a method with no options must behave identically to passing `{}`.
    // The no-options path now returns a shared cached defaults object instead of
    // allocating one per call; this guards that the shared object stays read-only.
    it('omitting options equals passing {} for every public method', () => {
      const url = 'https://sub.example.co.uk/path?q=1';
      expect(tldts.parse(url)).to.deep.equal(tldts.parse(url, {}));
      expect(tldts.getHostname(url)).to.equal(tldts.getHostname(url, {}));
      expect(tldts.getDomain(url)).to.equal(tldts.getDomain(url, {}));
      expect(tldts.getPublicSuffix(url)).to.equal(
        tldts.getPublicSuffix(url, {}),
      );
      expect(tldts.getSubdomain(url)).to.equal(tldts.getSubdomain(url, {}));
      expect(tldts.getDomainWithoutSuffix(url)).to.equal(
        tldts.getDomainWithoutSuffix(url, {}),
      );
    });

    // A prior call with custom options must not corrupt the shared defaults that
    // a subsequent no-options call relies on (co.uk is ICANN in all packages).
    it('a custom-options call does not corrupt later default-options results', () => {
      const url = 'https://sub.example.co.uk/';
      const before = tldts.getDomain(url); // default options
      // interleave calls with assorted non-default options
      tldts.getDomain(url, {
        allowPrivateDomains: true,
        validateHostname: false,
        detectIp: false,
      });
      tldts.getDomain('https://other.example.com/', { mixedInputs: false });
      const after = tldts.getDomain(url); // default options again
      expect(after).to.equal(before);
      expect(after).to.equal('example.co.uk');
    });
  });

  describe('public-suffix reconstruction (single-slice offset)', () => {
    // Rules match across multiple labels: the suffix is rebuilt via a single
    // hostname.slice at the computed offset (was parts.slice(i).join('.')).
    it('returns a multi-label rules suffix unchanged', () => {
      expect(tldts.getPublicSuffix('not.evil.co.uk')).to.equal('co.uk');
      expect(tldts.getDomain('a.b.c.example.co.uk')).to.equal('example.co.uk');
    });

    // Exception match: suffix offset uses index+1 (the exception removes its
    // own left-most label, e.g. !www.ck -> suffix 'ck').
    it('returns an exception suffix unchanged', () => {
      expect(tldts.getPublicSuffix('www.ck')).to.equal('ck');
    });
  });

  describe('hostname validation dedupe', () => {
    // Already-valid lowercase hostname: extractHostname returns the SAME string
    // reference, so the post-extraction validation is skipped — result must
    // still be that hostname.
    it('keeps an already-valid hostname', () => {
      expect(tldts.getHostname('example.co.uk')).to.equal('example.co.uk');
      expect(tldts.getHostname('sub.example.com')).to.equal('sub.example.com');
    });

    // Trailing dot is trimmed by extractHostname -> returned string differs from
    // the input -> the skip guard must NOT fire -> trimmed hostname is validated.
    it('still validates a trailing-dot hostname (guard does not fire)', () => {
      expect(tldts.getHostname('miam.miam.google.com.')).to.equal(
        'miam.miam.google.com',
      );
    });

    // Uppercase input is not a "valid hostname" to the validator, so the full
    // extraction + lowercasing path runs and the guard does not fire.
    it('lowercases an uppercase hostname', () => {
      expect(tldts.getHostname('EXAMPLE.COM')).to.equal('example.com');
    });

    // An invalid hostname must still be rejected: the guard only skips the
    // re-scan when the input was ALREADY valid, so it can never keep an invalid one.
    it('still rejects an invalid hostname', () => {
      expect(tldts.getHostname('foo-.com')).to.equal(null);
    });
  });

  describe('wildcard suffix reconstruction', () => {
    // *.sch.uk where the matched suffix spans every label of the hostname:
    // in the packed-hash impl this takes the backward-scan fallback branch
    // (matchLabels === number of hashed labels). Must return the full suffix.
    it('returns a wildcard suffix that spans the whole hostname', () => {
      expect(tldts.getPublicSuffix('foo.sch.uk')).to.equal('foo.sch.uk');
    });

    // *.sch.uk with an extra leading label (non-fallback wildcard branch).
    it('returns a wildcard suffix with a leading subdomain present', () => {
      expect(tldts.getPublicSuffix('pupils.school.sch.uk')).to.equal(
        'school.sch.uk',
      );
    });
  });

  describe('prototype-pollution-safe trie traversal', () => {
    // A label equal to an Object.prototype member, sitting where the trie has a
    // '*' wildcard child (*.ck), must match the wildcard — NOT resolve to
    // Object.prototype.constructor / the __proto__ accessor. Guards the
    // hasOwnProperty check (or, post-Stage-2, the substring-keyed lookup).
    it('treats constructor/__proto__ labels as ordinary labels under a wildcard', () => {
      expect(tldts.getPublicSuffix('b.constructor.ck')).to.equal(
        'constructor.ck',
      );
      expect(tldts.getPublicSuffix('b.__proto__.ck')).to.equal('__proto__.ck');
    });
  });
}
