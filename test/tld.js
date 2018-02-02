"use strict";

/* global suite, test */

var tld = require('../index.js');
// `isIp` is not exposed as part of the public API because it only works on
// valid hostname. Hence, we only use it internally.

var isIp = require('../lib/is-ip.js');
var parser = require('../lib/parsers/publicsuffix-org.js');
var expect = require('expect.js');


function repeat(str, n) {
  var res = '';
  for (var i = 0; i < n; i += 1) {
    res += str;
  }
  return res;
}


describe('tld.js', function () {
  describe('Constructor', function () {
    it('should be a pure object', function () {
      expect(tld.constructor.name).to.be('Object');
    });

    it('should have .rules map', function () {
      expect(tld.rules).to.be(undefined);
    });

    it('should not have any .validHosts property', function () {
      expect(tld.validHosts).to.be(undefined);
    });

    it('should export bound methods', function () {
      var getDomain = tld.getDomain;
      var domain = 'fr.google.com';

      expect(tld.getDomain(domain)).to.equal(getDomain(domain));
    });
  });

  describe('isValid method', function () {
    // That's a 255 characters long hostname
    var maxSizeHostname = 'a';
    for (var i = 0; i < 127; i += 1) {
      maxSizeHostname += '.a';
    }

    it('should detect valid hostname', function () {
      expect(tld.isValid('')).to.be(false);
      expect(tld.isValid('-google.com')).to.be(false);
      expect(tld.isValid('google-.com')).to.be(false);
      expect(tld.isValid('google.com-')).to.be(false);
      expect(tld.isValid('.google.com')).to.be(false);
      expect(tld.isValid('google..com')).to.be(false);
      expect(tld.isValid('google.com..')).to.be(false);
      expect(tld.isValid('example.' + repeat('a', 64) + '.')).to.be(false);
      expect(tld.isValid('example.' + repeat('a', 64))).to.be(false);
      expect(tld.isValid('googl@.com..')).to.be(false);

      // Length of 256 (too long)
      expect(tld.isValid(maxSizeHostname + 'a')).to.be(false);

      expect(tld.isValid('google.com')).to.be(true);
      expect(tld.isValid('miam.google.com')).to.be(true);
      expect(tld.isValid('miam.miam.google.com')).to.be(true);
      expect(tld.isValid('example.' + repeat('a', 63) + '.')).to.be(true);
      expect(tld.isValid('example.' + repeat('a', 63))).to.be(true);

      //@see https://github.com/oncletom/tld.js/issues/95
      expect(tld.isValid('miam.miam.google.com.')).to.be(true);

      // Length of 255 (maximum allowed)
      expect(tld.isValid(maxSizeHostname)).to.be(true);
    });

    it('should detect invalid hostname', function () {
      expect(tld.isValid(null)).to.be(false);
      expect(tld.isValid(undefined)).to.be(false);
      expect(tld.isValid(0)).to.be(false);
      expect(tld.isValid([])).to.be(false);
      expect(tld.isValid({})).to.be(false);
      expect(tld.isValid(function () {
      })).to.be(false);
    });

    it('should be falsy on invalid domain syntax', function () {
      expect(tld.isValid('.localhost')).to.be(false);
      expect(tld.isValid('.google.com')).to.be(false);
      expect(tld.isValid('.com')).to.be(false);
    });
  });

  describe('isIp method', function () {
    it('should return false on incorrect inputs', function () {
      expect(isIp('')).to.be(false);
      expect(isIp(null)).to.be(false);
      expect(isIp(undefined)).to.be(false);
      expect(isIp({})).to.be(false);
    });

    it('should return true on valid ip addresses', function () {
      expect(isIp('::1')).to.be(true);
      expect(isIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.be(true);
      expect(isIp('192.168.0.1')).to.be(true);
    });

    it('should return false on invalid ip addresses', function () {
      expect(isIp('::1-')).to.be(false);
      expect(isIp('[::1]')).to.be(false);
      expect(isIp('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).to.be(false);
      expect(isIp('192.168.0.1.')).to.be(false);
      expect(isIp('192.168.0')).to.be(false);
      expect(isIp('192.168.0.')).to.be(false);
      expect(isIp('192.16-8.0.1')).to.be(false);
    });
  });

  describe('getDomain method', function () {
    it('should return the expected domain from a simple string', function () {
      expect(tld.getDomain('google.com')).to.equal('google.com');
      expect(tld.getDomain('t.co')).to.equal('t.co');
      expect(tld.getDomain('  GOOGLE.COM   ')).to.equal('google.com');
      expect(tld.getDomain('    t.CO    ')).to.equal('t.co');
    });

    it('should return the relevant domain of a two levels domain', function () {
      expect(tld.getDomain('google.co.uk')).to.equal('google.co.uk');
    });

    it('should return the relevant domain from a subdomain string', function () {
      expect(tld.getDomain('fr.google.com')).to.equal('google.com');
      expect(tld.getDomain('foo.google.co.uk')).to.equal('google.co.uk');
      expect(tld.getDomain('fr.t.co')).to.equal('t.co');
    });

    it('should not break on specific RegExp characters', function (){
      expect(function (){
        //@see https://github.com/oncletom/tld.js/issues/33
        tld.getDomain('www.weir)domain.com');
      }).not.to.throwError();
      expect(function (){
        //@see https://github.com/oncletom/tld.js/issues/53
        tld.getDomain("http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php");
      }).not.to.throwError();
      expect(function (){
        //@see https://github.com/oncletom/tld.js/issues/53
        tld.getDomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.to.throwError();
    });

    //@see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', function (){
      var domain = tld.getDomain('http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3');
      expect(domain).to.equal('jsdelivr.net');
    });

    it('should provide consistent results', function(){
      expect(tld.getDomain('www.bl.uk')).to.equal('bl.uk');
      expect(tld.getDomain('www.majestic12.co.uk')).to.equal('majestic12.co.uk');
    });

    //@see https://github.com/oncletom/tld.js/issues/25
    //@see https://github.com/oncletom/tld.js/issues/30
    it('existing rule constraint', function () {
      expect(tld.getDomain('s3.amazonaws.com')).to.be(null);
      expect(tld.getDomain('blogspot.co.uk')).to.be(null);
    });

    it('should return nytimes.com even in a whole valid', function(){
      expect(tld.getDomain('http://www.nytimes.com/')).to.be('nytimes.com');
    });

    //@see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', function () {
      expect(tld.getDomain('https://www.google.co.uk./maps')).to.equal('google.co.uk');
    });
  });

  describe('tldExists method', function () {
    it('should be truthy on existing TLD', function () {
      expect(tld.tldExists('com')).to.be(true);
      expect(tld.tldExists('example.com')).to.be(true);
      expect(tld.tldExists('co.uk')).to.be(true);
      expect(tld.tldExists('amazon.co.uk')).to.be(true);
      expect(tld.tldExists('台灣')).to.be(true);
      expect(tld.tldExists('台灣.台灣')).to.be(true);
    });

    it('should be falsy on unexisting TLD', function () {
      expect(tld.tldExists('con')).to.be(false);
      expect(tld.tldExists('example.con')).to.be(false);
      expect(tld.tldExists('go')).to.be(false);
      expect(tld.tldExists('チーズ')).to.be(false);
    });

    it('should be truthy on complex TLD which cannot be verified as long as the gTLD exists', function(){
      expect(tld.tldExists('uk.com')).to.be(true);
    });

    //@see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', function () {
      expect(tld.tldExists('https://www.google.co.uk./maps')).to.be(true);
    });
  });

  describe('#getPublicSuffix', function () {
    it('should return co.uk if google.co.uk', function () {
      expect(tld.getPublicSuffix('google.co.uk')).to.be('co.uk');
    });

    // @see https://github.com/oncletom/tld.js/pull/97
    it('should return www.ck if www.www.ck', function () {
      expect(tld.getPublicSuffix('www.www.ck')).to.be('ck');
    });

    //@see https://github.com/oncletom/tld.js/issues/30
    it('should return s3.amazonaws.com if s3.amazonaws.com', function () {
      expect(tld.getPublicSuffix('s3.amazonaws.com')).to.be('s3.amazonaws.com');
    });

    it('should return s3.amazonaws.com if www.s3.amazonaws.com', function () {
      expect(tld.getPublicSuffix('s3.amazonaws.com')).to.be('s3.amazonaws.com');
    });

    it('should directly return the suffix if it matches a rule key', function(){
      expect(tld.getPublicSuffix('youtube')).to.be('youtube');
    });

    it('should return the suffix if a rule exists that has no exceptions', function(){
      expect(tld.getPublicSuffix('microsoft.eu')).to.be('eu');
    });

    // @see https://github.com/oncletom/tld.js/pull/97
    it('should return the string TLD if the publicsuffix does not exist', function(){
      expect(tld.getPublicSuffix('www.freedom.nsa')).to.be('nsa');
    });

    // @see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', function () {
      expect(tld.getPublicSuffix('https://www.google.co.uk./maps')).to.equal('co.uk');
    });
  });

  describe('extractHostname', function(){
    it('should return a valid hostname as is', function(){
      expect(tld.extractHostname(' example.CO.uk ')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less URL', function(){
      expect(tld.extractHostname('example.co.uk/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + port URL', function(){
      expect(tld.extractHostname('example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication URL', function(){
      expect(tld.extractHostname('user:password@example.co.uk/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless URL', function(){
      expect(tld.extractHostname('user@example.co.uk/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + authentication + port URL', function(){
      expect(tld.extractHostname('user:password@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a scheme-less + passwordless + port URL', function(){
      expect(tld.extractHostname('user@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a user-password same-scheme URL', function(){
      expect(tld.extractHostname('//user:password@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a passwordless same-scheme URL', function(){
      expect(tld.extractHostname('//user@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a complex user-password scheme URL', function(){
      expect(tld.extractHostname('git+ssh://user:password@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the hostname of a complex passwordless scheme URL', function(){
      expect(tld.extractHostname('git+ssh://user@example.co.uk:8080/some/path?and&query#hash')).to.equal('example.co.uk');
    });

    it('should return the initial value if it is not a valid hostname', function(){
      expect(tld.extractHostname(42)).to.equal('42');
    });

    it('should return www.nytimes.com even with an URL as a parameter', function(){
      expect(tld.extractHostname('http://www.nytimes.com/glogin?URI=http://www.notnytimes.com/2010/03/26/us/politics/26court.html&OQ=_rQ3D1Q26&OP=45263736Q2FKgi!KQ7Dr!K@@@Ko!fQ24KJg(Q3FQ5Cgg!Q60KQ60W.WKWQ22KQ60IKyQ3FKigQ24Q26!Q26(Q3FKQ60I(gyQ5C!Q2Ao!fQ24')).to.equal('www.nytimes.com');
    });

    it('should return punycode for international hostnames', function() {
      expect(tld.extractHostname('台灣')).to.equal('xn--kpry57d');
    });

    //@see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', function () {
      expect(tld.extractHostname('http://example.co.uk./some/path?and&query#hash')).to.equal('example.co.uk');
    });
  });

  describe('getSubdomain method', function(){
    it('should return null if the domain cannot be found', function(){
      expect(tld.getSubdomain('not-a-validHost')).to.equal(null);
    });

    it('should return the relevant subdomain of a hostname', function(){
      expect(tld.getSubdomain('localhost')).to.equal(null);
      expect(tld.getSubdomain('google.com')).to.equal('');
      expect(tld.getSubdomain('fr.google.com')).to.equal('fr');
      expect(tld.getSubdomain('random.fr.google.com')).to.equal('random.fr');
      expect(tld.getSubdomain('my.custom.domain')).to.equal('my');
    });

    it('should return the relevant subdomain of a badly trimmed string', function(){
      expect(tld.getSubdomain(' google.COM')).to.equal('');
      expect(tld.getSubdomain('   fr.GOOGLE.COM ')).to.equal('fr');
      expect(tld.getSubdomain(' random.FR.google.com')).to.equal('random.fr');
    });

    it('should return the subdomain of a TLD + SLD hostname', function(){
      expect(tld.getSubdomain('love.fukushima.jp')).to.equal('');
      expect(tld.getSubdomain('i.love.fukushima.jp')).to.equal('i');
      expect(tld.getSubdomain('random.nuclear.strike.co.jp')).to.equal('random.nuclear');
    });

    it('should return the subdomain of a wildcard hostname', function(){
      expect(tld.getSubdomain('google.co.uk')).to.equal('');
      expect(tld.getSubdomain('fr.google.co.uk')).to.equal('fr');
      expect(tld.getSubdomain('random.fr.google.co.uk')).to.equal('random.fr');
    });

    //@see https://github.com/oncletom/tld.js/issues/25
    it.skip('should return the subdomain of reserved subdomains', function(){
      expect(tld.getSubdomain('blogspot.co.uk')).to.equal('');
      expect(tld.getSubdomain('emergency.blogspot.co.uk')).to.equal('emergency');
    });

    it('should not break on specific RegExp characters', function (){
      expect(function (){
        //@see https://github.com/oncletom/tld.js/issues/33
        tld.getSubdomain('www.weir)domain.com');
      }).not.to.throwError();
      expect(function (){
        //@see https://github.com/oncletom/tld.js/issues/53
        tld.getSubdomain("http://('4drsteve.com', [], ['54.213.246.177'])/xmlrpc.php");
      }).not.to.throwError();
      expect(function (){
        //@see https://github.com/oncletom/tld.js/issues/53
        tld.getSubdomain("('4drsteve.com', [], ['54.213.246.177'])");
      }).not.to.throwError();
    });

    //@see https://github.com/oncletom/tld.js/issues/53
    it('should correctly extract domain from paths including "@" in the path', function (){
      var domain = tld.getSubdomain('http://cdn.jsdelivr.net/g/jquery@1.8.2,jquery.waypoints@2.0.2,qtip2@2.2.1,typeahead.js@0.9.3,sisyphus@0.1,jquery.slick@1.3.15,fastclick@1.0.3');
      expect(domain).to.equal('cdn');
    });

    //@see https://github.com/oncletom/tld.js/issues/35
    it('should provide consistent results', function(){
      expect(tld.getSubdomain('www.bl.uk')).to.equal('www');
      expect(tld.getSubdomain('www.majestic12.co.uk')).to.equal('www');
    });

    //@see https://github.com/oncletom/tld.js/issues/95
    it('should ignore the trailing dot in a domain', function () {
      expect(tld.getSubdomain('random.fr.google.co.uk.')).to.equal('random.fr');
    });
  });

  describe('#parse', function () {
    it('should handle ipv6 addresses properly', function () {
      expect(tld.parse('http://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]')).to.eql({
        hostname: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        isValid: true,
        isIp: true,
        tldExists: false,
        publicSuffix: null,
        domain: null,
        subdomain: null
      });
      expect(tld.parse('http://user:pass@[::1]/segment/index.html?query#frag')).to.eql({
        hostname: '::1',
        isValid: true,
        isIp: true,
        tldExists: false,
        publicSuffix: null,
        domain: null,
        subdomain: null
      });
      expect(tld.parse('https://[::1]')).to.eql({
        hostname: '::1',
        isValid: true,
        isIp: true,
        tldExists: false,
        publicSuffix: null,
        domain: null,
        subdomain: null
      });
      expect(tld.parse('http://[1080::8:800:200C:417A]/foo')).to.eql({
        hostname: '1080::8:800:200c:417a',
        isValid: true,
        isIp: true,
        tldExists: false,
        publicSuffix: null,
        domain: null,
        subdomain: null
      });
    });


    it('should handle ipv4 addresses properly', function () {
      expect(tld.parse('http://192.168.0.1/')).to.eql({
        hostname: '192.168.0.1',
        isValid: true,
        isIp: true,
        tldExists: false,
        publicSuffix: null,
        domain: null,
        subdomain: null,
      });

      // `url.parse` currently does not support decoding urls (whatwg-url does)
      // expect(tld.parse('http://%30%78%63%30%2e%30%32%35%30.01%2e')).to.eql({
      //   hostname: '192.168.0.1',
      //   isValid: true,
      //   isIp: true,
      //   tldExists: false,
      //   publicSuffix: null,
      //   domain: null,
      //   subdomain: null,
      // });
    });
  });

  describe('validHosts', function(){
    var customTld;

    context('non-empty array', function () {
      before(function(){
        customTld = tld.fromUserSettings({
          validHosts: ['localhost']
        });
      });

      it('should now be a valid host', function(){
        expect(customTld.isValid('localhost')).to.be(true);
      });

      it('should return the known valid host', function () {
        expect(customTld.getDomain('localhost')).to.equal('localhost');
        expect(customTld.getDomain('subdomain.localhost')).to.equal('localhost');
        expect(customTld.getDomain('subdomain.notlocalhost')).to.equal('subdomain.notlocalhost');
        expect(customTld.getDomain('subdomain.not-localhost')).to.equal('subdomain.not-localhost');
      });

      //@see https://github.com/oncletom/tld.js/issues/66
      it('should return the subdomain of a validHost', function(){
        expect(customTld.getSubdomain('vhost.localhost')).to.equal('vhost');
      });

      it('should fallback to normal extraction if no match in validHost', function(){
        expect(customTld.getSubdomain('vhost.evil.com')).to.equal('vhost');
      });
    });

    context('empty value', function () {
      it('falls-back to empty array', function () {
        expect(function () {
          customTld = tld.fromUserSettings({ validHosts: null });
        }).not.to.throwError();
        expect(function () {
          customTld = tld.fromUserSettings({ validHosts: undefined });
        }).not.to.throwError();
        expect(function () {
          customTld = tld.fromUserSettings({ validHosts: [] });
        }).not.to.throwError();
      });
    });
  });

  describe('SuffixTrie', function () {
    it('should ignore empty line', function () {
      var tlds = parser.parse('\n');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({});
    });

    it('should ignore comment', function () {
      var tlds = parser.parse('// \n');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({});
    });

    it('should parse up to the first space', function () {
      var tlds = parser.parse('co.uk .evil');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({ uk: { co: { $: 0 } } });
    });

    it('should parse normal rule', function () {
      var tlds = parser.parse('co.uk');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({ uk: { co: { $: 0 } } });
    });

    it('should parse exception', function () {
      var tlds = parser.parse('!co.uk');
      expect(tlds.exceptions).to.eql({ uk: { co: { $: 0 } } });
      expect(tlds.rules).to.eql({});
    });

    it('should parse wildcard', function () {
      var tlds = parser.parse('*');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({ '*': { $: 0 } });
      expect(tlds.suffixLookup('foo')).to.equal('foo');

      tlds = parser.parse('*.uk');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({ uk: { '*': { $: 0 } } });
      expect(tlds.suffixLookup('bar.uk')).to.equal('bar.uk');
      expect(tlds.suffixLookup('bar.baz')).to.equal(null);

      tlds = parser.parse('foo.*.baz');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({ baz: { '*': { foo: { $: 0 } } } });
      expect(tlds.suffixLookup('foo.bar.baz')).to.equal('foo.bar.baz');
      expect(tlds.suffixLookup('foo.foo.bar')).to.equal(null);
      expect(tlds.suffixLookup('bar.foo.baz')).to.equal(null);
      expect(tlds.suffixLookup('foo.baz')).to.equal(null);
      expect(tlds.suffixLookup('baz')).to.equal(null);

      tlds = parser.parse('foo.bar.*');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({ '*': { bar: { foo: { $: 0 } } } });
      expect(tlds.suffixLookup('foo.bar.baz')).to.equal('foo.bar.baz');
      expect(tlds.suffixLookup('foo.foo.bar')).to.equal(null);

      tlds = parser.parse('foo.*.*');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({ '*': { '*': { foo: { $: 0 } } } });
      expect(tlds.suffixLookup('foo.bar.baz')).to.equal('foo.bar.baz');
      expect(tlds.suffixLookup('foo.foo.bar')).to.equal('foo.foo.bar');
      expect(tlds.suffixLookup('baz.foo.bar')).to.equal(null);

      tlds = parser.parse('fo.bar.*\nfoo.bar.baz');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({
        baz: {
          bar: { foo: { $: 0 } },
        },
        '*': {
          bar: { fo: { $: 0 } },
        }
      });
      expect(tlds.suffixLookup('foo.bar.baz')).to.equal('foo.bar.baz');

      tlds = parser.parse('bar.*\nfoo.bar.baz');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({
        baz: {
          bar: { foo: { $: 0 } },
        },
        '*': {
          bar: { $: 0 },
        }
      });
      expect(tlds.suffixLookup('foo.bar.baz')).to.equal('foo.bar.baz');
    });

    it('should insert rules with same TLD', function () {
      var tlds = parser.parse('co.uk\nca.uk');
      expect(tlds.exceptions).to.eql({});
      expect(tlds.rules).to.eql({
        uk: {
          ca: { $: 0 },
          co: { $: 0 }
        }
      });
    });
  });
});
