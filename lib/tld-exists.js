"use strict";

var cleanHostValue = require('./clean-host.js');
var extractTldFromHost = require('./from-host.js');

/**
 * Checks if the TLD exists for a given host
 *
 * @api
 * @param {string} host
 * @return {boolean}
 */
module.exports = function tldExists(rules, hostname) {
  hostname = cleanHostValue(hostname);

  // Easy case, it's a TLD
  if (rules.hasTld(hostname)) {
    return true;
  }

  // Popping only the TLD of the hostname
  var hostTld = extractTldFromHost(hostname);
  if (hostTld === null) {
    return false;
  }

  return rules.hasTld(hostTld);
};
