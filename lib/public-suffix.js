var cleanHostValue = require('./clean-host.js');
var extractTldFromHost = require('./from-host.js');

/**
 * Returns the public suffix (including exact matches)
 *
 * @api
 * @since 1.5
 * @param {string} host
 * @return {String}
 */
module.exports = function getPublicSuffix(rules, host, isHostClean) {
  var cleanHost = cleanHostValue(host, isHostClean);

  // Host is a valid TLD
  if (rules.hasTld(cleanHost)) {
    return cleanHost;
  }

  var candidate = rules.suffixLookup(cleanHost);
  if (candidate === null) {
    // Prevailing rule is '*'
    return extractTldFromHost(cleanHost);
  }

  return candidate;
};
