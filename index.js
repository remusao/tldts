"use strict";

// Load rules
var Trie = require('./lib/suffix-trie.js');
var allRules = Trie.fromJson(require('./rules.json'));

var cleanHostValue = require('./lib/clean-host.js');
var getDomain = require('./lib/domain.js');
var getSubdomain = require('./lib/subdomain.js');
var isValid = require('./lib/is-valid.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var tldExists = require('./lib/tld-exists.js');

/**
 * Creates a new instance of tldjs
 * @param  {Object.<rules,validHosts>} options [description]
 * @return {tldjs|Object}                      [description]
 */
function factory(options) {
  var rules = options.rules || allRules || {};
  var validHosts = options.validHosts || [];

  return {
    cleanHostValue: cleanHostValue,
    getDomain: function (host) {
      return getDomain(rules, validHosts, host);
    },
    getSubdomain: function (host) {
      return getSubdomain(rules, validHosts, host);
    },
    isValid: function (host) {
      return isValid(validHosts, host);
    },
    getPublicSuffix: function (host) {
      return getPublicSuffix(rules, host);
    },
    tldExists: function (tld) {
      return tldExists(rules, tld);
    },
    fromUserSettings: factory
  };
}

module.exports = factory({ validHosts: [], rules: allRules });
