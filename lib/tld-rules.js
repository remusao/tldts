"use strict";

var Rule = require('./rule.js');
var map = require('./polyfills/array-map.js');

/**
 * Retrieve a subset of rules for a Top-Level-Domain string
 *
 * @param tld {String} Top-Level-Domain string
 * @return {Array} Rules subset
 */
module.exports = function getRulesForTld (allRules, tld, default_rule) {
  var exception = '!';
  var wildcard = '*';
  var append_tld_rule = true;
  var rules = allRules[tld];

  // Already parsed
  // Array.isArray polyfill for IE8
  if (Object.prototype.toString.call(rules)  === '[object Array]') {
    return rules;
  }

  // Nothing found, apply some default value
  if (rules === void 0) {
    return default_rule ? [ default_rule ] : [];
  }

  // Parsing needed
  rules = map(rules.split('|'), function transformAsRule (sld) {
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

  allRules[tld] = rules.reverse();

  return rules;
};
