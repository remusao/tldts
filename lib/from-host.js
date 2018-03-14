'use strict';

/**
 * Utility to extract the TLD from a hostname string
 *
 * @param {string} host
 * @return {String}
 */
module.exports = function extractTldFromHost(hostname) {
  var lastDotIndex = hostname.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return null;
  }

  return hostname.substr(lastDotIndex + 1);
};
