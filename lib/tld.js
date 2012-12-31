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

    //sld matching? escape the loop immediately (except if it's an exception)
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
tld.prototype.getRulesForTld = function getRulesForTld(tld, default_rule){
  var exception = '!';
  var wildcard = '*';
  var rules = this.rules[tld];

  // Already parsed
  if (Array.isArray(rules)){
    return rules;
  }

  // Nothing found, apply some default value
  if (!rules){
    return default_rule ? [ default_rule ] : [];
  }

  // Parsing needed
  rules = rules.split('|').map(function transformAsRule(sld){
    var first_bit = sld[0];

    if (first_bit === exception || first_bit === wildcard){
      sld = sld.slice(1);
    }

    return new Rule({
      "firstLevel": tld,
      "secondLevel": sld,
      "exception": first_bit === exception,
      "wildcard": first_bit === wildcard
    });
  });

  rules.push(new Rule({
    "firstLevel": tld
  }));

  this.rules[tld] = rules;

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
  var domain = null, hostTld, rules, rule;

  if (this.isValid(host) === false){
    return null;
  }

  host = host.toLowerCase();
  hostTld = host.split('.').pop();
  rules = this.getRulesForTld(hostTld, new Rule({"firstLevel": hostTld}));
  rule = tld.getCandidateRule(host, rules);

  if (rule === null){
    return null;
  }

  host.replace(new RegExp(rule.getPattern()), function(m, d){
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
