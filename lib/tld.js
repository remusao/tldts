"use strict";

function tld (){
  this.rules = [];
}

tld.init = function () {
  return new tld();
};

tld.getNormalXld = function(rule){
  return (rule.secondLevel ? '.' + rule.secondLevel : '') + '.' + rule.firstLevel;
};

tld.getNormalPattern = function(rule){
  return (rule.secondLevel ? '\\.' + rule.secondLevel : '') + '\\.' + rule.firstLevel;
};

tld.getWildcardPattern = function(rule){
  return '\\.[^\\.]+' + tld.getNormalXld(rule);
};

tld.getExceptionPattern = function(rule){
  return (rule.secondLevel || '') + '\\.' + rule.firstLevel;
};

/**
 * Returns the best rule for a given host based on candidates
 *
 * @param host
 * @param rules
 * @return {*}
 */
tld.prototype.getCandidateRule = function (host, rules) {
  var rule = {'normal': null, 'exception': null};

  rules.reverse().some(function(r){
    var pattern;

    //sld matching? escape the loop immediatly (except if it's an exception)
    if ('.'+host === tld.getNormalXld(r)){
      if (r.exception === true){
        rule.normal = r;
      }

      return true;
    }

    //otherwise check as a complete host
    //if it's an exception, we want to loop a bit more to a normal rule
    pattern = '.+' + tld.getNormalPattern(r) + '$';

    if ((new RegExp(pattern)).test(host)){
      rule[r.exception ? 'exception' : 'normal'] = r;
      return !r.exception;
    }

    return false;
  });

  return rule;
};

tld.prototype.getRulesForTld = function(tld){
  return this.rules.filter(function(rule){
    return rule.firstLevel === tld ? rule : null;
  });
};

/**
 * Detects the domain based on rules and upon and a host string
 *
 * @param uri
 * @return {String}
 */
tld.prototype.getDomain = function (host) {
  var pattern, hostTld, rules, rule;
  var domain = null;

  if (this.isValid(host) === false){
    return null;
  }

  host = host.toLowerCase();
  hostTld = host.split('.').pop();
  rules = this.getRulesForTld(hostTld);
  rule = this.getCandidateRule(host, rules);

  if (rule.normal === null){
    return null;
  }

  //if there is an exception, we challenge its rules without changing pattern
  if (rule.normal && rule.exception) {
    rule.normal.wildcard = rule.exception.wildcard;
  }

  if (rule.normal.exception === true){
    pattern = '(' + tld.getExceptionPattern(rule.normal) + ')$';
  }
  else if (rule.normal.wildcard === true){
    pattern = '([^\.]+' + tld.getWildcardPattern(rule.normal) + ')$';
  }
  else{
    pattern = '([^\.]+' + tld.getNormalPattern(rule.normal) + ')$';
  }

  host.replace(new RegExp(pattern), function(m, d){
    domain = d;
  });

  return domain;
};

/**
 * Checking if a host is valid
 *
 * @param host {String}
 * @return {Boolean}
 */
tld.prototype.isValid = function (host){
  return !(typeof host !== 'string' || host.indexOf('.') === -1 || host[0] === '.');
};

module.exports = tld;
