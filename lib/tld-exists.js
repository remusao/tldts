var cleanHostValue = require('./clean-host.js');
var extractTldFromHost = require('./from-host.js');

/**
 * Checks if the TLD exists for a given host
 *
 * @api
 * @param {string} host
 * @return {boolean}
 */
module.exports = function tldExists(rules, host){
  var hostTld;

  host = cleanHostValue(host);

  // Easy case, it's a TLD
  if (rules[host]){
    return true;
  }

  // Popping only the TLD of the hostname
  hostTld = extractTldFromHost(host);

  return rules[hostTld] !== undefined;
};
