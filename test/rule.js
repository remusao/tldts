"use strict";

/*jshint node:true strict: true */
/*global suite:true test:true suiteSetup:true */

var Rule = require(__dirname + '/../lib/rule.js');
var expect = require('expect.js');

suite('Public Suffix Rule', function(){
  var rules;

  suiteSetup(function(){
    rules = {
      tld: new Rule({firstLevel: 'com'}),
      sld: new Rule({firstLevel: 'com', 'secondLevel': 'uk'}),
      tldWildcard: new Rule({firstLevel: 'om', wildcard: true}),
      sldException: new Rule({firstLevel: 'om', secondLevel: 'songfest', exception: true}),
      sldWildcard: new Rule({firstLevel: 'om', secondLevel: 'fake', wildcard: true})
    };
  });

  test('#constructor', function(){
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

  test('#getNormalXld()', function(){

  });

  test('#getNormalPattern()', function(){

  });

  test('#getWildcardPattern()', function(){

  });

  test('#getExceptionPattern()', function(){

  });

  test('#getPattern()', function(){

  });
});