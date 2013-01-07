"use strict";

/*jshint node:true strict: true */
/*global suite:true test:true */

var tld = require('../index.js');
var expect = require('expect.js');

suite('tld.js', function () {
  suite('Basics', function () {
    test('Rules are already loaded', function () {
      expect(tld.rules).to.be.an(Object);
      expect(Object.keys(tld.rules).length).to.be.above(0);
    });
  });

  suite('#isValid()', function () {
    test('Good ones', function () {
      expect(tld.isValid('')).to.be(false);
      expect(tld.isValid('google.com')).to.be(true);
      expect(tld.isValid('miam.google.com')).to.be(true);
      expect(tld.isValid('miam.miam.google.com')).to.be(true);
    });
    test('Invalid types', function () {
      expect(tld.isValid(null)).to.be(false);
      expect(tld.isValid(undefined)).to.be(false);
      expect(tld.isValid(0)).to.be(false);
      expect(tld.isValid([])).to.be(false);
      expect(tld.isValid({})).to.be(false);
      expect(tld.isValid(function () {
      })).to.be(false);
    });

    test('Invalid notation', function () {
      expect(tld.isValid('.google.com')).to.be(false);
      expect(tld.isValid('.com')).to.be(false);
    });

    test('Dot-less hostname', function () {
      expect(tld.isValid('localhost')).to.be(false);
      expect(tld.isValid('google')).to.be(false);
    });
  });

  suite('#getDomain()', function () {
    test('basic domains', function () {
      expect(tld.getDomain('google.com')).to.be('google.com');
      expect(tld.getDomain('t.co')).to.be('t.co');
    });

    test('composed ', function () {
      expect(tld.getDomain('google.co.uk')).to.be('google.co.uk');
    });

    test('subdomains', function () {
      expect(tld.getDomain('fr.google.com')).to.be('google.com');
      expect(tld.getDomain('foo.google.co.uk')).to.be('google.co.uk');
      expect(tld.getDomain('fr.t.co')).to.be('t.co');
    });
  });

  suite('#domainExists', function () {
    test('existing domain', function(){
      expect(tld.domainExists('com')).to.be(true);
      expect(tld.domainExists('uk.com')).to.be(true);
      expect(tld.domainExists('co.uk')).to.be(true);
      expect(tld.domainExists('台灣')).to.be(true);
    });

    test('inexisting domain', function(){
      expect(tld.domainExists('con')).to.be(false);
      expect(tld.domainExists('google.com')).to.be(false);
      expect(tld.domainExists('go')).to.be(false);
      expect(tld.domainExists('チーズ')).to.be(false);
    });
  });
});