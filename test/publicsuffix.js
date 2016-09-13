"use strict";

/* global suite, test, setup */

var tld = require('../index.js');
var expect = require('expect.js');
var checkPublicSuffix;

describe('PublicSuffix tests', function(){
  beforeEach(function(){
    //ease testing by simply copy/pasting tests from Mozilla Central
    //@see http://mxr.mozilla.org/mozilla-central/source/netwerk/test/unit/data/test_psl.txt?raw=1
    checkPublicSuffix = function(testDomain, expectedResult){
      expect(tld.getDomain(testDomain)).to.equal(expectedResult);
    };
  });

  it('null input.', function(){
    checkPublicSuffix(null, null);
  });

  it('Mixed case.', function(){
    checkPublicSuffix('COM', null);
    checkPublicSuffix('example.COM', 'example.com');
    checkPublicSuffix('WwW.example.COM', 'example.com');
  });

  it('Leading dot.', function(){
    checkPublicSuffix('.com', null);
    checkPublicSuffix('.example', null);
    checkPublicSuffix('.example.com', null);
    checkPublicSuffix('.example.example', null);
  });

  it('Unlisted TLD.', function(){
    checkPublicSuffix('example', null);
    checkPublicSuffix('example.example', 'example.example');
    checkPublicSuffix('b.example.example', 'example.example');
    checkPublicSuffix('a.b.example.example', 'example.example');
  });

  it.skip('Listed, but non-Internet, TLD.', function(){
    checkPublicSuffix('local', null);
    checkPublicSuffix('example.local', null);
    checkPublicSuffix('b.example.local', null);
    checkPublicSuffix('a.b.example.local', null);
  });

  it('TLD with only 1 rule.', function(){
    checkPublicSuffix('biz', null);
    checkPublicSuffix('domain.biz', 'domain.biz');
    checkPublicSuffix('b.domain.biz', 'domain.biz');
    checkPublicSuffix('a.b.domain.biz', 'domain.biz');
  });

  it('TLD with some 2-level rules.', function(){
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

  it('TLD with only 1 (wildcard) rule.', function(){
    checkPublicSuffix('mm', null);
    checkPublicSuffix('c.mm', null);
    checkPublicSuffix('b.c.mm', 'b.c.mm');
    checkPublicSuffix('a.b.c.mm', 'b.c.mm');
  });

  it('More complex TLD.', function(){
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

  it('TLD with a wildcard rule and exceptions.', function(){
    checkPublicSuffix('ck', null);
    checkPublicSuffix('test.ck', null);
    checkPublicSuffix('b.test.ck', 'b.test.ck');
    checkPublicSuffix('a.b.test.ck', 'b.test.ck');
    checkPublicSuffix('www.ck', 'www.ck');
    checkPublicSuffix('www.www.ck', 'www.ck');
  });

  it('US K12.', function(){
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

  it('IDN labels.', function(){
    // checkPublicSuffix('食狮.com.cn', '食狮.com.cn');
    // checkPublicSuffix('食狮.公司.cn', '食狮.公司.cn');
    // checkPublicSuffix('www.食狮.公司.cn', '食狮.公司.cn');
    // checkPublicSuffix('shishi.公司.cn', 'shishi.公司.cn');
    // checkPublicSuffix('公司.cn', null);
    // checkPublicSuffix('食狮.中国', '食狮.中国');
    // checkPublicSuffix('www.食狮.中国', '食狮.中国');
    // checkPublicSuffix('shishi.中国', 'shishi.中国');
    // checkPublicSuffix('中国', null);
  });

  it('Same as above, but punycoded.', function(){
    checkPublicSuffix('xn--85x722f.com.cn', 'xn--85x722f.com.cn');
    checkPublicSuffix('xn--85x722f.xn--55qx5d.cn', 'xn--85x722f.xn--55qx5d.cn');
    checkPublicSuffix('www.xn--85x722f.xn--55qx5d.cn', 'xn--85x722f.xn--55qx5d.cn');
    checkPublicSuffix('shishi.xn--55qx5d.cn', 'shishi.xn--55qx5d.cn');
    checkPublicSuffix('xn--55qx5d.cn', null);
    checkPublicSuffix('xn--85x722f.xn--fiqs8s', 'xn--85x722f.xn--fiqs8s');
    checkPublicSuffix('www.xn--85x722f.xn--fiqs8s', 'xn--85x722f.xn--fiqs8s');
    checkPublicSuffix('shishi.xn--fiqs8s', 'shishi.xn--fiqs8s');
    checkPublicSuffix('xn--fiqs8s', null);
  });
});
