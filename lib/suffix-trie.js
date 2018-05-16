'use strict';

var punycode = require('punycode');

// Flags used to know if a rule is ICANN or Private
var ICANN_HOSTNAME = 1;
var PRIVATE_HOSTNAME = 2;


/**
 * Return the lookup object having the longest match, ignoring possible `-1` values.
 */
function longestMatch(a, b) {
  if (a.index === -1) {
    return b;
  } else if (b.index === -1) {
    return a;
  }

  return a.index < b.index ? a : b;
}


/**
 * Insert a public suffix rule in the `trie`.
 *
 * @param {object} rule
 * @param {object} trie
 * @return {object} trie (updated)
 */
function insertInTrie(rule, trie) {
  var parts = rule.parts;
  var node = trie;

  for (var i = 0; i < parts.length; i += 1) {
    var part = parts[i];
    var nextNode = node[part];
    if (nextNode === undefined) {
      nextNode = Object.create(null);
      node[part] = nextNode;
    }

    node = nextNode;
  }

  node.$ = rule.isIcann ? ICANN_HOSTNAME : PRIVATE_HOSTNAME;

  return trie;
}


/**
 * Recursive lookup of `parts` (starting at `index`) in the tree.
 *
 * @param {array} parts
 * @param {object} trie
 * @param {number} index - when to start in `parts` (initially: length - 1)
 * @return {number} size of the suffix found (in number of parts matched)
 */
function lookupInTrie(parts, trie, index, allowedMask) {
  var part;
  var nextNode;
  var lookupResult = {
    index: -1,
    isIcann: false,
    isPrivate: false,
  };

  // We have a match!
  if (trie.$ !== undefined && (trie.$ & allowedMask) !== 0) {
    lookupResult = {
      index: index + 1,
      isIcann: trie.$ === ICANN_HOSTNAME,
      isPrivate: trie.$ === PRIVATE_HOSTNAME,
    };
  }

  // No more `parts` to look for
  if (index === -1) {
    return lookupResult;
  }

  part = parts[index];

  // Check branch corresponding to next part of hostname
  nextNode = trie[part];
  if (nextNode !== undefined) {
    lookupResult = longestMatch(
      lookupResult,
      lookupInTrie(parts, nextNode, index - 1, allowedMask)
    );
  }

  // Check wildcard branch
  nextNode = trie['*'];
  if (nextNode !== undefined) {
    lookupResult = longestMatch(
      lookupResult,
      lookupInTrie(parts, nextNode, index - 1, allowedMask)
    );
  }

  return lookupResult;
}


/**
 * Contains the public suffix ruleset as a Trie for efficient look-up.
 *
 * @constructor
 */
function SuffixTrie(rules) {
  this.exceptions = Object.create(null);
  this.rules = Object.create(null);

  if (rules) {
    for (var i = 0; i < rules.length; i += 1) {
      var rule = rules[i];
      if (rule.exception) {
        insertInTrie(rule, this.exceptions);
      } else {
        insertInTrie(rule, this.rules);
      }
    }
  }
}


/**
 * Load the trie from JSON (as serialized by JSON.stringify).
 */
SuffixTrie.fromJson = function (json) {
  var trie = new SuffixTrie();

  trie.exceptions = json.exceptions;
  trie.rules = json.rules;

  return trie;
};


/**
 * Check if `value` is a valid TLD.
 */
SuffixTrie.prototype.hasTld = function (value) {
  // All TLDs are at the root of the Trie.
  return this.rules[value] !== undefined;
};


/**
 * Check if `hostname` has a valid public suffix in `trie`.
 *
 * @param {string} hostname
 * @return {string|null} public suffix
 */
SuffixTrie.prototype.suffixLookup = function (hostname, options) {
  var allowIcannDomains = options.allowIcannDomains;
  var allowPrivateDomains = options.allowPrivateDomains;

  var hostnameParts = hostname.split('.');
  var parts = [];
  for (var i = 0; i < hostnameParts.length; i += 1) {
    var part = hostnameParts[i];
    if (part.startsWith('xn--')) {
      part = punycode.toUnicode(part);
    }
    parts.push(part);
  }

  var allowedMask = 0;

  // Define set of accepted public suffix (ICANN, PRIVATE)
  if (allowPrivateDomains === true) {
    allowedMask |= PRIVATE_HOSTNAME;
  }
  if (allowIcannDomains === true) {
    allowedMask |= ICANN_HOSTNAME;
  }

  // Look for a match in rules
  var lookupResult = lookupInTrie(
    parts,
    this.rules,
    parts.length - 1,
    allowedMask
  );

  if (lookupResult.index === -1) {
    return null;
  }

  // Look for exceptions
  var exceptionLookupResult = lookupInTrie(
    parts,
    this.exceptions,
    parts.length - 1,
    allowedMask
  );

  if (exceptionLookupResult.index !== -1) {
    return {
      isIcann: exceptionLookupResult.isIcann,
      isPrivate: exceptionLookupResult.isPrivate,
      publicSuffix: hostnameParts.slice(exceptionLookupResult.index + 1).join('.'),
    };
  }

  return {
    isIcann: lookupResult.isIcann,
    isPrivate: lookupResult.isPrivate,
    publicSuffix: hostnameParts.slice(lookupResult.index).join('.'),
  };
};


module.exports = SuffixTrie;
