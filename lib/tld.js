"use strict";

/*jshint node:true strict: true */

var Rule = require(__dirname + '/rule.js');

/**
 * tld library
 *
 * Useable methods are those documented with an @api in JSDoc
 * See README.md for more explainations on how to use this stuff.
 */
function tld () {
  /*jshint validthis: true */
  this.rules = [];
}

tld.init = function init () {
  return new tld();
};

/**
 * Returns the best rule for a given host based on candidates
 *
 * @static
 * @param host {String} Hostname to check rules against
 * @param rules {Array} List of rules used to work on
 * @return {Object} Candidate object, with a normal and exception state
 */
tld.getCandidateRule = function getCandidateRule (host, rules) {
  var rule = {'normal': null, 'exception': null};

  rules.some(function (r) {
    var pattern;

    //sld matching? escape the loop immediately (except if it's an exception)
    if ('.' + host === r.getNormalXld()) {
      if (r.exception === true) {
        rule.normal = r;
      }

      return true;
    }

    //otherwise check as a complete host
    //if it's an exception, we want to loop a bit more to a normal rule
    pattern = '.+' + r.getNormalPattern() + '$';

    if ((new RegExp(pattern)).test(host)) {
      rule[r.exception ? 'exception' : 'normal'] = r;
      return !r.exception;
    }

    return false;
  });

  //if there is an exception, we challenge its rules without changing pattern
  if (rule.normal && rule.exception) {
    rule.normal.wildcard = rule.exception.wildcard;
  }

  return rule.normal;
};

/**
 * Retrieve a subset of rules for a Top-Level-Domain string
 *
 * @param tld {String} Top-Level-Domain string
 * @return {Array} Rules subset
 */
tld.prototype.getRulesForTld = function getRulesForTld (tld, default_rule) {
  var exception = '!';
  var wildcard = '*';
  var append_tld_rule = true;
  var rules = this.rules[tld];

  // Already parsed
  if (Array.isArray(rules)) {
    return rules;
  }

  // Nothing found, apply some default value
  if (!rules) {
    return default_rule ? [ default_rule ] : [];
  }

  // Parsing needed
  rules = rules.split('|').map(function transformAsRule (sld) {
    var first_bit = sld[0];

    if (first_bit === exception || first_bit === wildcard) {
      sld = sld.slice(1);

      if (!sld) {
        append_tld_rule = false;
      }
    }

    return new Rule({
      "firstLevel":  tld,
      "secondLevel": sld,
      "exception":   first_bit === exception,
      "wildcard":    first_bit === wildcard
    });
  });

  // Always prepend to make it the latest rule to be applied
  if (append_tld_rule) {
    rules.unshift(new Rule({
      "firstLevel": tld
    }));
  }

  this.rules[tld] = rules.reverse();

  return rules;
};

/**
 * Checks if the TLD exists for a given host
 *
 * @api
 * @param {string} host
 * @return {boolean}
 */
tld.prototype.tldExists = function tldExists(host){
  var hostTld;

  host = tld.cleanHostValue(host);

  // Easy case, it's a TLD
  if (this.rules[host]){
    return true;
  }

  // Popping only the TLD of the hostname
  hostTld = tld.extractTldFromHost(host);

  return this.rules[hostTld] !== undefined;
};

/**
 * Detects the domain based on rules and upon and a host string
 *
 * @api
 * @param {string} host
 * @return {String}
 */
tld.prototype.getDomain = function getDomain (host) {
  var domain = null, hostTld, rules, rule;

  if (this.isValid(host) === false) {
    return null;
  }

  host = tld.cleanHostValue(host);
  hostTld = tld.extractTldFromHost(host);
  rules = this.getRulesForTld(hostTld, new Rule({"firstLevel": hostTld}));
  rule = tld.getCandidateRule(host, rules);

  if (rule === null) {
    return null;
  }

  host.replace(new RegExp(rule.getPattern()), function (m, d) {
    domain = d;
  });

  return domain;
};

/**
 * Returns the subdomain of a host string
 *
 * @api
 * @param {string} host
 * @return {string|null} a subdomain string if any, blank string if subdomain is empty, otherwise null
 */
tld.prototype.getSubdomain = function getSubdomain(host){
  var domain, r, subdomain = null;

  host = tld.cleanHostValue(host);
  domain = this.getDomain(host);

  // No domain found? Just abort, abort!
  if (domain === null){
    return subdomain;
  }

  r = '\\.?'+(domain.replace(/\./g, '\\.'))+'$';
  subdomain = host.replace(new RegExp(r, 'i'), '');

  return subdomain;
};

/**
 * Checking if a host string is valid
 * It's usually a preliminary check before trying to use getDomain or anything else
 *
 * Beware: it does not check if the TLD exists.
 *
 * @api
 * @todo handle localhost, local etc.
 * @param host {String}
 * @return {Boolean}
 */
tld.prototype.isValid = function isValid (host) {
  return !(typeof host !== 'string' || host.indexOf('.') === -1 || host[0] === '.');
};

/**
 * Utility to cleanup the base host value
 *
 * @param {string} host
 * @return {String}
 */
tld.cleanHostValue = function cleanHostValue(host){
  return (host+'').trim().toLowerCase();
};

/**
 * Utility to extract the TLD from a host string
 *
 * @param {string} host
 * @return {String}
 */
tld.extractTldFromHost = function extractTldFromHost(host){
  return host.split('.').pop();
};

module.exports = tld;
