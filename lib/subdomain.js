var cleanHostValue = require('./clean-host.js');
var getDomain = require('./domain.js');

/**
 * Returns the subdomain of a host string
 *
 * @api
 * @param {string} host
 * @return {string|null} a subdomain string if any, blank string if subdomain is empty, otherwise null
 */
module.exports = function getSubdomain(allRules, validHosts, host, dirtyHost) {
  var cleanHost = (dirtyHost || true) ? cleanHostValue(host) : host;
  var domain = getDomain(allRules, validHosts, cleanHost, false);

  // No domain found? Just abort, abort!
  if (domain === null) {
    return null;
  }

  return cleanHost.substring(0, cleanHost.length - domain.length - 1);
};
