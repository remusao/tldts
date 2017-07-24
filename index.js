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
    getDomain: function (host, isHostClean) {
      return getDomain(rules, validHosts, host, isHostClean);
    },
    getSubdomain: function (host, isHostClean) {
      return getSubdomain(rules, validHosts, host, isHostClean);
    },
    isValid: function (host) {
      return isValid(validHosts, host);
    },
    getPublicSuffix: function (host, isHostClean) {
      return getPublicSuffix(rules, host, isHostClean);
    },
    tldExists: function (tld, isHostClean) {
      return tldExists(rules, tld, isHostClean);
    },
    fromUserSettings: factory
  };
}

module.exports = factory({ validHosts: [], rules: allRules });
