"use strict";

/* global suite, test, suiteSetup */

var Rule = require('../lib/rule.js');
var expect = require('expect.js');

describe('Rule Object', function () {
  var rules;

  beforeEach(function () {
    rules = {
      tld:          new Rule({firstLevel: 'com'}),
      sld:          new Rule({firstLevel: 'com', 'secondLevel': 'uk'}),
      tldWildcard:  new Rule({firstLevel: 'om', wildcard: true}),
      sldException: new Rule({firstLevel: 'om', secondLevel: 'songfest', exception: true}),
      sldWildcard:  new Rule({firstLevel: 'om', secondLevel: 'fake', wildcard: true})
    };
  });

  it('should construct properly against various Rule configurations', function () {
    expect(rules.tld.secondLevel).to.equal(null);
    expect(rules.tld.wildcard).to.be(false);
    expect(rules.tld.exception).to.be(false);

    expect(rules.sld.secondLevel).to.equal('uk');

    expect(rules.tldWildcard.secondLevel).to.equal(null);
    expect(rules.tldWildcard.wildcard).to.be(true);
    expect(rules.tldWildcard.exception).to.be(false);

    expect(rules.sldException.secondLevel).to.equal('songfest');
    expect(rules.sldException.wildcard).to.be(false);
    expect(rules.sldException.exception).to.be(true);

    expect(rules.sldWildcard.secondLevel).to.equal('fake');
    expect(rules.sldWildcard.wildcard).to.be(true);
    expect(rules.sldWildcard.exception).to.be(false);
  });

  it('should return valid XLD', function () {
    expect(rules.tld.getNormalXld()).to.equal('.com');
    expect(rules.sld.getNormalXld()).to.equal('.uk.com');
    expect(rules.tldWildcard.getNormalXld()).to.equal('.om');
    expect(rules.sldException.getNormalXld()).to.equal('.songfest.om');
    expect(rules.sldWildcard.getNormalXld()).to.equal('.fake.om');
  });

  it('should return valid pattern for regular rule', function () {
    expect(rules.tld.getNormalPattern()).to.equal('\\.com');
    expect(rules.sld.getNormalPattern()).to.equal('\\.uk\\.com');
  });

  it('should return valid pattern for wildcard rule', function () {
    expect(rules.tldWildcard.getWildcardPattern()).to.equal('\\.[^\\.]+\\.om');
    expect(rules.sldWildcard.getWildcardPattern()).to.equal('\\.[^\\.]+\\.fake\\.om');
  });

  it('should return valid pattern for exception rule', function () {
    expect(rules.sldException.getExceptionPattern()).to.equal('songfest\\.om');
  });

  it('should return valid complete pattern for any kind of rule', function () {
    expect(rules.tld.getPattern()).to.equal('([^\\.]+\\.com)$');
    expect(rules.sld.getPattern()).to.equal('([^\\.]+\\.uk\\.com)$');
    expect(rules.tldWildcard.getPattern()).to.equal('([^\\.]+\\.[^\\.]+\\.om)$');
    expect(rules.sldException.getPattern()).to.equal('(songfest\\.om)$');
    expect(rules.sldWildcard.getPattern()).to.equal('([^\\.]+\\.[^\\.]+\\.fake\\.om)$');
  });
});