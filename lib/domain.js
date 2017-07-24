var isValid = require('./is-valid.js');
var cleanHostValue = require('./clean-host.js');
var getPublicSuffix = require('./public-suffix.js');

/**
 * Detects the domain based on rules and upon and a host string
 *
 * @api
 * @param {string} host
 * @return {String}
 */
module.exports = function getDomain(allRules, validHosts, host, isHostClean) {
  var _validHosts = validHosts || [];
  var cleanHost = cleanHostValue(host, isHostClean);

  if (isValid(_validHosts, cleanHost) === false) {
    return null;
  }

  // Check if `host` ends with '.' followed by one host specified in validHosts.
  for (var i = 0; i < validHosts.length; i++) {
    var vhost = validHosts[i];
    if (cleanHost.indexOf(vhost) === (cleanHost.length - vhost.length) && (
          cleanHost.length === vhost.length ||
          cleanHost[cleanHost.length - vhost.length - 1] === '.')) {
      return vhost;
    }
  }

  var suffix = getPublicSuffix(allRules, cleanHost, true);
  if (suffix === null) {
    // TODO - shouldn't it be null?
    // Otherwise 'should return the known valid host' fails
    // return cleanHost;
    return null;
  }

  if (suffix.length === cleanHost.length) {
    return null;
  }

  // google.fr (length 9)
  // suffix = fr (length 2)
  // 5 = 9 - 2 - 1 (ignore the dot) - 1 (zero-based indexing)
  var lastDotBeforeSuffixIndex = cleanHost.lastIndexOf('.', cleanHost.length - suffix.length - 2);
  if (lastDotBeforeSuffixIndex === -1) {
    return cleanHost;
  }

  return cleanHost.substring(lastDotBeforeSuffixIndex + 1);
};
