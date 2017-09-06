'use strict';

// Load rules
var Trie = require('./lib/suffix-trie.js');
var allRules = Trie.fromJson(require('./rules.json'));

// Internals
var extractHostname = require('./lib/clean-host.js');
var getDomain = require('./lib/domain.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var getSubdomain = require('./lib/subdomain.js');
var isValid = require('./lib/is-valid.js');
var tldExists = require('./lib/tld-exists.js');


function parse(url, validHosts, rules, _extractHostname) {
  var hostname = _extractHostname(url);
  var valid = isValid(hostname);
  var suffix = null;
  var domain = null;
  var subdomain = null;

  if (valid) {
    suffix = getPublicSuffix(rules, hostname);
    domain = getDomain(validHosts, suffix, hostname);
    subdomain = getSubdomain(hostname, domain);
  }

  return {
    valid,
    hostname,
    suffix,
    domain,
    subdomain,
  };
}


/**
 * Creates a new instance of tldjs
 * @param  {Object.<rules,validHosts>} options [description]
 * @return {tldjs|Object}                      [description]
 */
function factory(options) {
  var rules = options.rules || allRules || {};
  var validHosts = options.validHosts || [];
  var _extractHostname = options.extractHostname || extractHostname;

  return {
    extractHostname: _extractHostname,
    isValid: isValid,
    tldExists: function (url) {
      var hostname = _extractHostname(url);
      return tldExists(rules, hostname);
    },
    getPublicSuffix: function (url) {
      return parse(url, validHosts, rules, _extractHostname).suffix;
    },
    getDomain: function (url) {
      return parse(url, validHosts, rules, _extractHostname).domain;
    },
    getSubdomain: function (url) {
      return parse(url, validHosts, rules, _extractHostname).subdomain;
    },
    parse: function (url) {
      return parse(url, validHosts, rules, _extractHostname);
    },
    fromUserSettings: factory
  };
}


module.exports = factory({});
