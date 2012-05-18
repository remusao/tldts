var tld = require('../index.js');
var expect = require('expect.js');

suite('tld.js', function(){
  suite('Basics', function(){
    test('Rules are already loaded', function(){
      expect(tld.rules).to.be.an('array');
      expect(tld.rules.length).to.be.above(0);
    });
  });

  suite('#getDomain()', function(){
    test('basic domains', function(){
      expect(tld.getDomain('google.com')).to.be('google.com');
      expect(tld.getDomain('t.co')).to.be('t.co');
    });

    test('composed ', function() {
      expect(tld.getDomain('google.co.uk')).to.be('google.co.uk');
    });

    test('subdomains', function() {
      expect(tld.getDomain('fr.google.com')).to.be('google.com');
      expect(tld.getDomain('foo.google.co.uk')).to.be('google.co.uk');
      expect(tld.getDomain('fr.t.co')).to.be('t.co');
    });
  });
});