"use strict";

/*jshint node:true strict: true */

var Rule = require(__dirname + '/rule.js');

/**
 * tld library
 *
 * Useable methods are those documented with an @api in JSDoc
 * See README.md for more explainations on how to use this stuff.
 */
function tld (){
  /*jshint validthis: true */
  this.rules = [];
}

tld.init = function init() {
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
tld.getCandidateRule = function getCandidateRule(host, rules) {
  var rule = {'normal': null, 'exception': null};

  rules.reverse().some(function(r){
    var pattern;

    //sld matching? escape the loop immediatly (except if it's an exception)
    if ('.'+host === r.getNormalXld()){
      if (r.exception === true){
        rule.normal = r;
      }

      return true;
    }

    //otherwise check as a complete host
    //if it's an exception, we want to loop a bit more to a normal rule
    pattern = '.+' + r.getNormalPattern() + '$';

    if ((new RegExp(pattern)).test(host)){
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
tld.prototype.getRulesForTld = function getRulesForTld(tld){
  return this.rules
    .filter(function filterOutFirstLevel(rule){
      return rule.firstLevel === tld;
    })
    .map(function transformAsRule(rule){
      return new Rule(rule);
    });
};

/**
 * If no rules are available, it means we don't know the domain.
 * Mozilla Public Suffix list now considers the domain to be valid
 * We deal with it as if it was a ".com" domain
 *
 * @since 1.0.2
 * @see https://github.com/oncletom/tld.js/issues/7
 * @param {Array} rules Filtered rules for the given TLD
 * @param {String} tld TLD on which we candidate against
 * @return {Array} Updated set of rules
 */
tld.prototype.appendUnknownDomainRule = function appendUnknownDomainRule(rules, tld){
  if (rules.length === 0){
    rules.push(new Rule({
      "firstLevel": tld,
      "source": tld
    }));
  }

  return rules;
};

/**
 * Detects the domain based on rules and upon and a host string
 *
 * @api
 * @param {string} host
 * @return {String}
 */
tld.prototype.getDomain = function getDomain(host) {
  var pattern, hostTld, rules, rule;
  var domain = null;

  if (this.isValid(host) === false){
    return null;
  }

  host = host.toLowerCase();
  hostTld = host.split('.').pop();
  rules = this.getRulesForTld(hostTld);
  rules = this.appendUnknownDomainRule(rules, hostTld);
  rule = tld.getCandidateRule(host, rules);

  if (rule === null){
    return null;
  }

  pattern = rule.getPattern();

  return this.getDomainFromPattern(host, pattern);
};

tld.prototype.getDomainFromPattern = function getDomainFromPattern(host, pattern){
  var domain = null;
  host = (host+'');

  host.replace(new RegExp(pattern), function(m, d){
    domain = d;
  });

  return domain;
};

/**
 * Checking if a host is valid
 *
 * @api
 * @todo handle localhost, local etc.
 * @param host {String}
 * @return {Boolean}
 */
tld.prototype.isValid = function isValid(host){
  return !(typeof host !== 'string' || host.indexOf('.') === -1 || host[0] === '.');
};

module.exports = tld;
