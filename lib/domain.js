var Rule = require('./rule.js');
var isValid = require('./is-valid.js');
var cleanHostValue = require('./clean-host.js');
var extractTldFromHost = require('./from-host.js');
var getCandidateRule = require('./canditate-rule.js');
var getRulesForTld = require('./tld-rules.js');

/**
 * Detects the domain based on rules and upon and a host string
 *
 * @api
 * @param {string} host
 * @return {String}
 */
module.exports = function getDomain (allRules, validHosts, host) {
  var domain = null, hostTld, rules, rule;
  var _validHosts = validHosts || [];

  if (isValid(_validHosts, host) === false) {
    return null;
  }

  host = cleanHostValue(host);
  hostTld = extractTldFromHost(host);
  rules = getRulesForTld(allRules, hostTld, new Rule({"firstLevel": hostTld, "isHost": _validHosts.indexOf(hostTld) !== -1}));
  rule = getCandidateRule(host, rules);

  if (rule === null) {
    return null;
  }

  host.replace(new RegExp(rule.getPattern()), function (m, d) {
    domain = d;
  });

  return domain;
};
