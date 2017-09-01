"use strict";

/**
 * Utility to extract the TLD from a host string
 *
 * @param {string} host
 * @return {String}
 */
module.exports = function extractTldFromHost(host) {
  var lastDotIndex = host.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return null;
  }

  return host.substr(lastDotIndex + 1);
};
