var cleanHostValue = require('./clean-host.js');
var extractTldFromHost = require('./from-host.js');

/**
 * Checks if the TLD exists for a given host
 *
 * @api
 * @param {string} host
 * @return {boolean}
 */
module.exports = function tldExists(rules, host, dirtyHost = true) {
  var cleanHost = dirtyHost ? cleanHostValue(host) : host;
  var hostTld;

  // Easy case, it's a TLD
  if (rules.hasTld(cleanHost)) {
    return true;
  }

  // Popping only the TLD of the hostname
  hostTld = extractTldFromHost(cleanHost);
  if (hostTld === null) {
    return false;
  }

  return rules.hasTld(hostTld);
};
