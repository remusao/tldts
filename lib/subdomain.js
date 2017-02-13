var cleanHostValue = require('./clean-host.js');
var getDomain = require('./domain.js');
var escapeRegExp = require('./escape-regexp.js');

/**
 * Returns the subdomain of a host string
 *
 * @api
 * @param {string} host
 * @return {string|null} a subdomain string if any, blank string if subdomain is empty, otherwise null
 */
module.exports = function getSubdomain(allRules, validHosts, host){
  var domain, r, subdomain;

  host = cleanHostValue(host);
  domain = getDomain(allRules, validHosts, host);

  // No domain found? Just abort, abort!
  if (domain === null){
    return null;
  }

  r = '\\.?'+ escapeRegExp(domain)+'$';
  subdomain = host.replace(new RegExp(r, 'i'), '');

  return subdomain;
};
