"use strict";

/*jshint node:true strict: true */
/*global suite:true test:true setup:true */

var tld = require('../index.js');
var expect = require('expect.js');
var checkPublicSuffix;

suite('http://publicsuffix.org/list/test.txt', function(){
  setup(function(){
    //ease testing by simply copy/pasting tests from Mozilla Central
    //@see http://mxr.mozilla.org/mozilla-central/source/netwerk/test/unit/data/test_psl.txt?raw=1
    checkPublicSuffix = function(testDomain, expectedResult){
      expect(tld.getDomain(testDomain)).to.be(expectedResult);
    };
  });

  test('NULL input', function(){
    checkPublicSuffix(null, null);
  });

  test('Mixed case', function(){
    checkPublicSuffix('COM', null);
    checkPublicSuffix('example.COM', 'example.com');
    checkPublicSuffix('WwW.example.COM', 'example.com');
  });

  test('Leading dot', function(){
    checkPublicSuffix('.com', null);
    checkPublicSuffix('.example', null);
    checkPublicSuffix('.example.com', null);
    checkPublicSuffix('.example.example', null);
  });

  test('Unlisted TLD', function(){
    checkPublicSuffix('example', null);
    checkPublicSuffix('example.example', 'example.example');
    checkPublicSuffix('b.example.example', 'example.example');
    checkPublicSuffix('a.b.example.example', 'example.example');
  });

  test.skip('Listed, but non-Internet, TLD', function(){
   checkPublicSuffix('local', null);
   checkPublicSuffix('example.local', null);
   checkPublicSuffix('b.example.local', null);
   checkPublicSuffix('a.b.example.local', null);
  });

  test('TLD with only 1 rule', function(){
    checkPublicSuffix('biz', null);
    checkPublicSuffix('domain.biz', 'domain.biz');
    checkPublicSuffix('b.domain.biz', 'domain.biz');
    checkPublicSuffix('a.b.domain.biz', 'domain.biz');
  });

  test('TLD with some 2-level rules', function(){
    checkPublicSuffix('com', null);
    checkPublicSuffix('example.com', 'example.com');
    checkPublicSuffix('b.example.com', 'example.com');
    checkPublicSuffix('a.b.example.com', 'example.com');
    checkPublicSuffix('uk.com', null);
    checkPublicSuffix('example.uk.com', 'example.uk.com');
    checkPublicSuffix('b.example.uk.com', 'example.uk.com');
    checkPublicSuffix('a.b.example.uk.com', 'example.uk.com');
    checkPublicSuffix('test.ac', 'test.ac');
  });

  test('TLD with only 1 (wildcard) rule', function(){
    checkPublicSuffix('cy', null);
    checkPublicSuffix('c.cy', null);
    checkPublicSuffix('b.c.cy', 'b.c.cy');
    checkPublicSuffix('a.b.c.cy', 'b.c.cy');
  });

  test('More complex TLD', function(){
    checkPublicSuffix('jp', null);
    checkPublicSuffix('test.jp', 'test.jp');
    checkPublicSuffix('www.test.jp', 'test.jp');
    checkPublicSuffix('ac.jp', null);
    checkPublicSuffix('test.ac.jp', 'test.ac.jp');
    checkPublicSuffix('www.test.ac.jp', 'test.ac.jp');
    checkPublicSuffix('kyoto.jp', null);
    checkPublicSuffix('test.kyoto.jp', 'test.kyoto.jp');
    checkPublicSuffix('ide.kyoto.jp', null);
    checkPublicSuffix('b.ide.kyoto.jp', 'b.ide.kyoto.jp');
    checkPublicSuffix('a.b.ide.kyoto.jp', 'b.ide.kyoto.jp');
    checkPublicSuffix('c.kobe.jp', null);
    checkPublicSuffix('b.c.kobe.jp', 'b.c.kobe.jp');
    checkPublicSuffix('a.b.c.kobe.jp', 'b.c.kobe.jp');
    checkPublicSuffix('city.kobe.jp', 'city.kobe.jp');
    checkPublicSuffix('www.city.kobe.jp', 'city.kobe.jp');
  });

  test('TLD with a wildcard rule and exceptions', function(){
    checkPublicSuffix('om', null);
    checkPublicSuffix('test.om', null);
    checkPublicSuffix('b.test.om', 'b.test.om');
    checkPublicSuffix('a.b.test.om', 'b.test.om');
    checkPublicSuffix('songfest.om', 'songfest.om');
    checkPublicSuffix('www.songfest.om', 'songfest.om');
  });

  test('US K12', function(){
    checkPublicSuffix('us', null);
    checkPublicSuffix('test.us', 'test.us');
    checkPublicSuffix('www.test.us', 'test.us');
    checkPublicSuffix('ak.us', null);
    checkPublicSuffix('test.ak.us', 'test.ak.us');
    checkPublicSuffix('www.test.ak.us', 'test.ak.us');
    checkPublicSuffix('k12.ak.us', null);
    checkPublicSuffix('test.k12.ak.us', 'test.k12.ak.us');
    checkPublicSuffix('www.test.k12.ak.us', 'test.k12.ak.us');
  });
});