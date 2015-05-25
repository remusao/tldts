"use strict";

var PublicSuffixOrgParser = {};

var punycode = require('punycode');

/**
 * Parse a one-domain-per-line file
 *
 * @param body {String}
 * @return {Array}
 */
PublicSuffixOrgParser.parse = function (body){
  return (body+'')
    .split(/\n/m)
    .filter(PublicSuffixOrgParser.filterRow)
    .map(PublicSuffixOrgParser.domainBuilder);
};

/**
 * Returns a rule based on string analysis
 *
 * @param rule {PublicSuffixRule}
 */
PublicSuffixOrgParser.domainBuilder = function (row){
  var rule = {};
  
  row = punycode.toASCII(row.trim());

  //setting initial rule
  rule.source = row;

  //exception
  row = row.replace(/^!(.+)$/, function(m, tld){
    rule.exception = true;

    return tld;
  });

  //wildcard
  row = row.replace(/^(\*\.)(.+)$/, function(m, dummy, tld){
    rule.wildcard = true;

    return tld;
  });

  //splitting domains
  row.replace(/^((.+)\.)?([^\.]+)$/, function(m, dummy, secondLevel, firstLevel){
    rule.firstLevel = firstLevel;

    if (secondLevel){
      rule.secondLevel = secondLevel;
    }

  });

  return rule;
};

/**
 * Filters a commented or empty line
 *
 * @param row {String}
 * @return {String|null}
 */
PublicSuffixOrgParser.filterRow = function (row) {
  return (/^\/\//).test(row) ? null : row;
};

module.exports = PublicSuffixOrgParser;
