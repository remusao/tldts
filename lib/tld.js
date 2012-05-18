"use strict";

function tld (){
  this.rules = [];
}

tld.init = function () {
  return new tld();
};

tld.getCompleteXld = function(rule){
  return (rule.secondLevel ? '.' + rule.secondLevel : '') +'.' + rule.firstLevel;
};

tld.getCompleteXldPattern = function (rule){
  return (rule.wildcard ? '\.[^\.]+' : '') +
    tld.getCompleteXld(rule).replace('.', '\.');
};

/**
 * Returns the best rule for a given host based on candidates
 *
 * @param host
 * @param rules
 * @return {*}
 */
tld.prototype.getCandidateRule = function (host, rules) {
  var rule = null;

  rules.reverse().some(function(r){
    var pattern = '.+' + tld.getCompleteXldPattern(r) + '$';

    if ((new RegExp(pattern)).test(host)){
      rule = r;

      return true;
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
  var pattern, domain;
  var hostTld = host.split('.').pop();
  var rules = this.getRulesForTld(hostTld);
  var rule = this.getCandidateRule(host, rules);

  if (rule === null){
    return rule;
  }

  pattern = '([^\.]+'+(tld.getCompleteXldPattern(rule))+')$';
  host.replace(new RegExp(pattern), function(m, d){
    domain = d;
  });

  return domain;
};

module.exports = tld;