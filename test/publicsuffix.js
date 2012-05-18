var tld = require('../index.js');
var expect = require('expect.js');

suite('http://publicsuffix.org/list/test.txt', function(){
  suite('NULL input', function(){
    expect(tld.getDomain(null)).to.be(null);
  });

  suite('Mixed case', function(){
    expect(tld.getDomain('COM')).to.be(null);
    expect(tld.getDomain('example.COM')).to.be('example.com');
    expect(tld.getDomain('WwW.example.COM')).to.be('example.com');
  });

  suite('Leading dot', function(){
    expect(tld.getDomain('.com')).to.be(null);
    expect(tld.getDomain('.example')).to.be(null);
    expect(tld.getDomain('.example.com')).to.be(null);
    expect(tld.getDomain('example.example')).to.be(null);
  });

  suite('Unlisted TLD', function(){
    expect(tld.getDomain('example')).to.be(null);
    expect(tld.getDomain('example.example')).to.be(null);
    expect(tld.getDomain('b.example.example')).to.be(null);
    expect(tld.getDomain('a.b.example.example')).to.be(null);
  });

  /*suite('Listed, but non-Internet, TLD', function(){
    expect(tld.getDomain('local')).to.be(null);
    expect(tld.getDomain('example.local')).to.be(null);
    expect(tld.getDomain('b.example.local')).to.be(null);
    expect(tld.getDomain('a.b.example.local')).to.be(null);
  });*/

  suite('TLD with only 1 rule', function(){
    expect(tld.getDomain('biz')).to.be(null);
    expect(tld.getDomain('domain.biz')).to.be('domain.biz');
    expect(tld.getDomain('b.domain.biz')).to.be('domain.biz');
    expect(tld.getDomain('a.b.domain.biz')).to.be('domain.biz');
  });

  suite('TLD with some 2-level rules', function(){
    expect(tld.getDomain('com')).to.be(null);
    expect(tld.getDomain('example.com')).to.be('example.com');
    expect(tld.getDomain('b.example.com')).to.be('example.com');
    expect(tld.getDomain('a.b.example.com')).to.be('example.com');
    expect(tld.getDomain('uk.com')).to.be(null);
    expect(tld.getDomain('example.uk.com')).to.be('example.uk.com');
    expect(tld.getDomain('b.example.uk.com')).to.be('example.uk.com');
    expect(tld.getDomain('a.b.example.uk.com')).to.be('example.uk.com');
    expect(tld.getDomain('test.ac')).to.be('test.ac');
  });

  suite('TLD with only 1 (wildcard) rule', function(){
    expect(tld.getDomain('cy')).to.be(null);
    expect(tld.getDomain('c.cy')).to.be(null);
    expect(tld.getDomain('b.c.cy')).to.be('b.c.cy');
    expect(tld.getDomain('a.b.c.cy')).to.be('b.c.cy');
  });

  suite('More complex TLD', function(){
    expect(tld.getDomain('jp')).to.be(null);
    expect(tld.getDomain('test.jp')).to.be('test.jp');
    expect(tld.getDomain('www.test.jp')).to.be('test.jp');
    expect(tld.getDomain('ac.jp')).to.be(null);
    expect(tld.getDomain('test.ac.jp')).to.be('test.ac.jp');
    expect(tld.getDomain('www.test.ac.jp')).to.be('test.ac.jp');
    expect(tld.getDomain('kyoto.jp')).to.be(null);
    //expect(tld.getDomain('c.kyoto.jp')).to.be(null);
    expect(tld.getDomain('b.c.kyoto.jp')).to.be('b.c.kyoto.jp');
    expect(tld.getDomain('a.b.c.kyoto.jp')).to.be('b.c.kyoto.jp');
    /*expect(tld.getDomain('pref.kyoto.jp')).to.be('pref.kyoto.jp');      //exception
    expect(tld.getDomain('www.pref.kyoto.jp')).to.be('pref.kyoto.jp');  //exception
    expect(tld.getDomain('city.kyoto.jp')).to.be('pref.kyoto.jp');      //exception
    expect(tld.getDomain('www.city.kyoto.jp')).to.be('pref.kyoto.jp');  //exception*/
  });

  suite('TLD with a wildcard rule and exceptions', function(){
    expect(tld.getDomain('om')).to.be(null);
    expect(tld.getDomain('test.om')).to.be(null);
    expect(tld.getDomain('b.test.om')).to.be('b.test.om');
    expect(tld.getDomain('a.b.test.om')).to.be('b.test.om');
    expect(tld.getDomain('songfest.om')).to.be('songfest.om');
    expect(tld.getDomain('www.songfest.om')).to.be('songfest.om');
  });

  suite('US K12', function(){
    expect(tld.getDomain('us')).to.be(null);
    expect(tld.getDomain('test.us')).to.be('test.us');
    expect(tld.getDomain('www.test.us')).to.be('test.us');
    expect(tld.getDomain('ak.us')).to.be(null);
    expect(tld.getDomain('test.ak.us')).to.be('test.ak.us');
    expect(tld.getDomain('www.test.ak.us')).to.be('test.ak.us');
    expect(tld.getDomain('k12.ak.us')).to.be(null);
    expect(tld.getDomain('test.k12.ak.us')).to.be('test.k12.ak.us');
    expect(tld.getDomain('www.test.k12.ak.us')).to.be('test.k12.ak.us');
  });
});