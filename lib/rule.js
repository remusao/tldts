"use strict";

/*jshint node:true strict: true */

function PublicSuffixRule (){
  this.exception = false;
  this.firstLevel = '';
  this.secondLevel = null;
  this.source = '';
  this.wildcard = false;
}

/**
 * Parse a one-domain-per-line file
 *
 * @param body {String}
 * @return {Array}
 */
PublicSuffixRule.parse = function (body){
  return (body+'').split(/\n/m).filter(PublicSuffixRule.filterRow).map(PublicSuffixRule.domainBuilder);
};

/**
 * Returns a rule based on string analysis
 *
 * @param rule {PublicSuffixRule}
 */
PublicSuffixRule.domainBuilder = function (row){
  var rule = Object.seal(new PublicSuffixRule());

  //setting initial rule
  rule.source = row;

  //exception
  row = row.replace(/^!(.+)$/, function(m, tld){
    rule.exception = true;

    return tld;
  });

  //wildcard
  row = row.replace(/^(\*\.)(.+)$/, function(m, dummy, tld){
    rule.wildcard = true;

    return tld;
  });

  //splitting domains
  row.replace(/^((.+)\.)?([^\.]+)$/, function(m, dummy, secondLevel, firstLevel){
    rule.firstLevel = firstLevel;
    rule.secondLevel = secondLevel || null;
  });

  return rule;
};

/**
 * Filters a commented or empty line
 *
 * @param row {String}
 * @return {String|null}
 */
PublicSuffixRule.filterRow = function (row) {
  return (/^\/\//).test(row) ? null : row;
};

module.exports = PublicSuffixRule;