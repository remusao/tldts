var cleanHostValue = require('./clean-host.js');
var extractTldFromHost = require('./from-host.js');
var getCandidateRule = require('./canditate-rule.js');
var getRulesForTld = require('./tld-rules.js');

/**
 * Returns the public suffix (including exact matches)
 *
 * @api
 * @since 1.5
 * @param {string} host
 * @return {String}
 */
module.exports = function getPublicSuffix(allRules, host) {
  var hostTld, rules, rule;

  if (host in allRules){
	  return host;
  }

  host = cleanHostValue(host);
  hostTld = extractTldFromHost(host);
  rules = getRulesForTld(allRules, hostTld);
  rule = getCandidateRule(host, rules, { lazy: true });

  if (rule === null) {
    return null;
  }

  return rule.getNormalXld().slice(1);
};
