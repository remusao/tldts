"use strict";

// Load rules
var Trie = require('./lib/suffix-trie.js');
var allRules = Trie.fromJson(require('./rules.json'));

var cleanHostValue = require('./lib/clean-host.js');
var getDomain = require('./lib/domain.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var getSubdomain = require('./lib/subdomain.js');
var isValid = require('./lib/is-valid.js');
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
    getDomain: function (hostname) {
      return getDomain(rules, validHosts, hostname);
    },
    getSubdomain: function (hostname) {
      return getSubdomain(rules, validHosts, hostname);
    },
    isValid: function (hostname) {
      return isValid(validHosts, hostname);
    },
    getPublicSuffix: function (hostname) {
      return getPublicSuffix(rules, hostname);
    },
    tldExists: function (tld) {
      return tldExists(rules, tld);
    },
    fromUserSettings: factory
  };
}


module.exports = factory({ validHosts: [], rules: allRules });
