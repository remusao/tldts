"use strict";

var allRules = require('./rules.json');

var cleanHostValue = require('./lib/clean-host.js');
var escapeRegExp = require('./lib/escape-regexp.js');
var getRulesForTld = require('./lib/tld-rules.js');
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
    escapeRegExp: escapeRegExp,
    getRulesForTld: getRulesForTld,
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
