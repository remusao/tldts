'use strict';

var punycode = require('punycode');
var SuffixTrie = require('../suffix-trie.js');

var PublicSuffixOrgParser = {};


/**
 * Parse a one-domain-per-line file
 *
 * @param body {String}
 * @return {Array}
 */
PublicSuffixOrgParser.parse = function (body) {
  var beginPrivateDomains = '// ===BEGIN PRIVATE DOMAINS===';
  var lines = ('' + body).split('\n');

  var rules = [];
  var isIcann = true;

  for (var i = 0; i < lines.length; i += 1) {
    var line = lines[i].trim();

    // Ignore empty lines
    if (line.length === 0) { continue; }

    // Comment (check for beginning of Private domains section)
    if (line.startsWith('//')) {
      if (line.startsWith(beginPrivateDomains)) {
        isIcann = false;
      }

      continue;
    }

    // TODO - Ignore leading or trailing dot

    // Only read line up to the first white-space
    var spaceIndex = line.indexOf(' ');
    if (spaceIndex !== -1) {
      line = line.substr(0, spaceIndex);
    }

    // Convert to punycode
    line = punycode.toASCII(line);

    // Check if the rule is an exception
    var exception = false;
    if (line[0] === '!') {
      line = line.substr(1);
      exception = true;
    }

    rules.push({
      isIcann: isIcann,
      exception: exception,
      source: lines[i],
      parts: line.split('.').reverse(),
    });
  }

  return new SuffixTrie(rules);
};


module.exports = PublicSuffixOrgParser;
