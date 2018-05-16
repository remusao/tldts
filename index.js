'use strict';

// Load rules
var Trie = require('./lib/suffix-trie.js');
var allRules = Trie.fromJson(require('./rules.json'));

// TODO - could be defined in the same file?
// Internals
var extractHostname = require('./lib/clean-host.js');
var getDomain = require('./lib/domain.js');
var getPublicSuffix = require('./lib/public-suffix.js');
var getSubdomain = require('./lib/subdomain.js');
var isValidHostname = require('./lib/is-valid.js');
var isIp = require('./lib/is-ip.js');
var tldExists = require('./lib/tld-exists.js');


// This is the set of possible options which can be used to customize tldjs,
// with their default values.
var defaultOptions = {
  rules: allRules,
  allowIcannDomains: true,
  allowPrivateDomains: false,
  validHosts: [],
  strictHostnameValidation: false,
  extractHostname: extractHostname,
};


function setDefaults(options) {
  if (options === undefined) {
    return defaultOptions;
  }

  // Merge options
  return Object.assign({}, defaultOptions, options);
}


// Flags representing steps in the `parse` function. They are used to implement
// an early stop mechanism (simulating some form of laziness) to avoid doing
// more work than necessary to perform a given action (e.g.: we don't need to
// extract the domain and subdomain if we are only interested in public suffix).
var HOSTNAME = 0;
var TLD_EXISTS = 1;
var PUBLIC_SUFFIX = 2;
var DOMAIN = 3;
var SUB_DOMAIN = 4;
var ALL = 5;


/**
 * Process a given url and extract all information. This is a higher level API
 * around private functions of `tld.js`. It allows to remove duplication (only
 * extract hostname from url once for all operations) and implement some early
 * termination mechanism to not pay the price of what we don't need (this
 * simulates laziness at a lower cost).
 *
 * @param {string} url
 * @param {number|undefined} _step - where should we stop processing
 * @return {object}
 */
function parse(url, options, _step) {
  options = setDefaults(options);
  var _extractHostname = options.extractHostname;
  var step = _step === undefined ? ALL : _step;

  var result = {
    hostname: _extractHostname(url, options),
    isValidHostname: null,
    isIp: null,
    tldExists: null,
    publicSuffix: null,
    isIcann: null,
    isPrivate: null,
    domain: null,
    subdomain: null,
  };

  if (result.hostname === null) {
    result.isIp = false;
    result.isValidHostname = false;
    return result;
  }

  // Check if `hostname` is a valid ip address
  result.isIp = isIp(result.hostname);
  if (result.isIp) {
    result.isValidHostname = true;
    return result;
  }

  // Check if `hostname` is valid
  result.isValidHostname = isValidHostname(result.hostname, options);
  if (result.isValidHostname === false) { return result; }
  if (step === HOSTNAME) { return result; }

  // Check if tld exists
  result.tldExists = tldExists(options.rules, result.hostname);
  if (step === TLD_EXISTS) { return result; }

  // Extract public suffix
  var publicSuffixResult = getPublicSuffix(
    options.rules,
    result.hostname,
    options);
  result.publicSuffix = publicSuffixResult.publicSuffix;
  result.isPrivate = publicSuffixResult.isPrivate;
  result.isIcann = publicSuffixResult.isIcann;
  if (step === PUBLIC_SUFFIX) { return result; }

  // Extract domain
  result.domain = getDomain(result.publicSuffix, result.hostname, options);
  if (step === DOMAIN) { return result; }

  // Extract subdomain
  result.subdomain = getSubdomain(result.hostname, result.domain, options);

  return result;
}


module.exports = {
  parse: parse,
  isValidHostname: function (url, options) {
    return isValidHostname(url, setDefaults(options));
  },
  tldExists: function (url, options) {
    return parse(url, options, TLD_EXISTS).tldExists;
  },
  getPublicSuffix: function (url, options) {
    return parse(url, options, PUBLIC_SUFFIX).publicSuffix;
  },
  getDomain: function (url, options) {
    return parse(url, options, DOMAIN).domain;
  },
  getSubdomain: function (url, options) {
    return parse(url, options, SUB_DOMAIN).subdomain;
  },
  getHostname: function (url, options) {
    return parse(url, options, HOSTNAME).hostname;
  },
};
