'use strict';

var punycode = require('punycode');
var SuffixTrie = require('../suffix-trie.js');

var PublicSuffixOrgParser = {};


/**
 * Filters a commented or empty line
 *
 * @param {string} row
 * @return {string|null}
 */
function keepOnlyRules(row) {
  var trimmed = row.trim();
  if (trimmed.length === 0 || trimmed.indexOf('//') === 0) {
    return null;
  }

  // TODO - Ignore leading or trailing dot

  return trimmed;
}


/**
 * Returns a rule based on string analysis
 *
 * @param {string} row
 * @return {object} a public suffix rule
 */
function domainBuilder(row) {
  var rule = {
    exception: false,
    source: null,
    parts: null,
  };

  // Only read line up to the first white-space
  var spaceIndex = row.indexOf(' ');
  if (spaceIndex !== -1) {
    row = row.substr(0, spaceIndex);
  }

  row = punycode.toASCII(row);

  // Keep track of initial rule
  rule.source = row;

  // Exception
  if (row[0] === '!') {
    row = row.substr(1);
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
