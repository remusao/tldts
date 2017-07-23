"use strict";

var punycode = require('punycode');
var SuffixTrie = require('../suffix-trie.js');

var PublicSuffixOrgParser = {};


/**
 * Filters a commented or empty line
 *
 * @param row {String}
 * @return {String|null}
 */
function keepOnlyRules(row) {
  var trimmed = row.trim();
  if (!trimmed || trimmed.indexOf('//') === 0) {
    return null;
  }

  // TODO - Ignore leading or trailing dot

  return trimmed;
}


/**
 * Returns a rule based on string analysis
 *
 * @param rule {PublicSuffixRule}
 */
function domainBuilder(row) {
  var rule = {
    exception: false,
    source: null,
    parts: null,
  };

  var spaceIndex = row.indexOf(' ');
  // Only read line up to the first white-space
  row = punycode.toASCII(row);

  //setting initial rule
  rule.source = row;

  // exceptions
  if (row[0] === '!') {
    row = row.substring(1);
    rule.exception = true;
  }

  rule.parts = row.split('.').reverse();

  return rule;
}


/**
 * Parse a one-domain-per-line file
 *
 * @param body {String}
 * @return {Array}
 */
PublicSuffixOrgParser.parse = function (body) {
  return new SuffixTrie((body + '')
    .split('\n')
    .map(keepOnlyRules)
    .filter(function (r) { return r !== null; })
    .map(domainBuilder));
};


module.exports = PublicSuffixOrgParser;
