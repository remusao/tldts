"use strict";

/*jshint node:true strict: true */
/*global suite:true test:true suiteSetup:true */

var Rule = require(__dirname + '/../lib/rule.js');
var expect = require('expect.js');

suite('Public Suffix Rule', function () {
  var rules;

  suiteSetup(function () {
    rules = {
      tld:          new Rule({firstLevel: 'com'}),
      sld:          new Rule({firstLevel: 'com', 'secondLevel': 'uk'}),
      tldWildcard:  new Rule({firstLevel: 'om', wildcard: true}),
      sldException: new Rule({firstLevel: 'om', secondLevel: 'songfest', exception: true}),
      sldWildcard:  new Rule({firstLevel: 'om', secondLevel: 'fake', wildcard: true})
    };
  });

  test('#constructor', function () {
    expect(rules.tld.secondLevel).to.be(null);
    expect(rules.tld.wildcard).to.be(false);
    expect(rules.tld.exception).to.be(false);

    expect(rules.sld.secondLevel).to.be('uk');

    expect(rules.tldWildcard.secondLevel).to.be(null);
    expect(rules.tldWildcard.wildcard).to.be(true);
    expect(rules.tldWildcard.exception).to.be(false);

    expect(rules.sldException.secondLevel).to.be('songfest');
    expect(rules.sldException.wildcard).to.be(false);
    expect(rules.sldException.exception).to.be(true);

    expect(rules.sldWildcard.secondLevel).to.be('fake');
    expect(rules.sldWildcard.wildcard).to.be(true);
    expect(rules.sldWildcard.exception).to.be(false);
  });

  test('#getNormalXld()', function () {
    expect(rules.tld.getNormalXld()).to.be('.com');
    expect(rules.sld.getNormalXld()).to.be('.uk.com');
    expect(rules.tldWildcard.getNormalXld()).to.be('.om');
    expect(rules.sldException.getNormalXld()).to.be('.songfest.om');
    expect(rules.sldWildcard.getNormalXld()).to.be('.fake.om');
  });

  test('#getNormalPattern()', function () {
    expect(rules.tld.getNormalPattern()).to.be('\\.com');
    expect(rules.sld.getNormalPattern()).to.be('\\.uk\\.com');
  });

  test('#getWildcardPattern()', function () {
    expect(rules.tldWildcard.getWildcardPattern()).to.be('\\.[^\\.]+\\.om');
    expect(rules.sldWildcard.getWildcardPattern()).to.be('\\.[^\\.]+\\.fake\\.om');
  });

  test('#getExceptionPattern()', function () {
    expect(rules.sldException.getExceptionPattern()).to.be('songfest\\.om');
  });

  test('#getPattern()', function () {
    expect(rules.tld.getPattern()).to.be('([^\\.]+\\.com)$');
    expect(rules.sld.getPattern()).to.be('([^\\.]+\\.uk\\.com)$');
    expect(rules.tldWildcard.getPattern()).to.be('([^\\.]+\\.[^\\.]+\\.om)$');
    expect(rules.sldException.getPattern()).to.be('(songfest\\.om)$');
    expect(rules.sldWildcard.getPattern()).to.be('([^\\.]+\\.[^\\.]+\\.fake\\.om)$');
  });
});