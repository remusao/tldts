"use strict";

/* global suite, test */

var tld = require('../index.js');
var expect = require('chai').expect;

describe('tld.js', function () {
  describe('Constructor', function () {
    it('should have have rules already loaded', function () {
      expect(tld.rules).to.be.an('object');
      expect(Object.keys(tld.rules)).not.to.be.empty;
    });
  });

  describe('isValid method', function () {
    it('should detect valid hostname', function () {
      expect(tld.isValid('')).to.be.false;
      expect(tld.isValid('google.com')).to.be.true;
      expect(tld.isValid('miam.google.com')).to.be.true;
      expect(tld.isValid('miam.miam.google.com')).to.be.true;
    });

    it('should detect invalid hostname', function () {
      expect(tld.isValid(null)).to.be.false;
      expect(tld.isValid(undefined)).to.be.false;
      expect(tld.isValid(0)).to.be.false;
      expect(tld.isValid([])).to.be.false;
      expect(tld.isValid({})).to.be.false;
      expect(tld.isValid(function () {
      })).to.be.false;
    });

    it('should be falsy on invalid domain syntax', function () {
      expect(tld.isValid('.google.com')).to.be.false;
      expect(tld.isValid('.com')).to.be.false;
    });

    it('should be falsy on dotless hostname', function () {
      expect(tld.isValid('localhost')).to.be.false;
      expect(tld.isValid('google')).to.be.false;
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

    //@see https://github.com/oncletom/tld.js/issues/33
    it('should not break on specific RegExp characters', function () {
      expect(tld.getDomain('www.weir)domain.com')).to.equal('weir)domain.com');
    });
  });

  describe('tldExists method', function () {
    it('should be truthy on existing TLD', function () {
      expect(tld.tldExists('com')).to.be.true;
      expect(tld.tldExists('example.com')).to.be.true;
      expect(tld.tldExists('co.uk')).to.be.true;
      expect(tld.tldExists('amazon.co.uk')).to.be.true;
      expect(tld.tldExists('台灣')).to.be.true;
      expect(tld.tldExists('台灣.台灣')).to.be.true;
    });

    it('should be falsy on unexisting TLD', function () {
      expect(tld.tldExists('con')).to.be.false;
      expect(tld.tldExists('example.con')).to.be.false;
      expect(tld.tldExists('go')).to.be.false;
      expect(tld.tldExists('チーズ')).to.be.false;
    });

    it('should be truthy on complex TLD which cannot be verified as long as the gTLD exists', function(){
      expect(tld.tldExists('uk.com')).to.be.true;
    });
  });

  describe('getSubdomain method', function(){
    it('should return the relevant subdomain of a hostname', function(){
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

    //@see https://github.com/oncletom/tld.js/issues/33
    it('should not break on specific RegExp characters', function () {
      expect(tld.getSubdomain('www.weir)domain.com')).to.equal('www');
    });
  });
});