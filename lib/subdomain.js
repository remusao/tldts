"use strict";

var cleanHostValue = require('./clean-host.js');
var getDomain = require('./domain.js');


/**
 * Returns the subdomain of a hostname string
 *
 * @api
 * @param {string} hostname
 * @return {string|null} a subdomain string if any, blank string if subdomain
 *  is empty, otherwise null.
 */
module.exports = function getSubdomain(rules, validHosts, hostname) {
  hostname = cleanHostValue(hostname);

  var domain = getDomain(rules, validHosts, hostname);

  // No domain found? Just abort, abort!
  if (domain === null) {
    return null;
  }

  return hostname.substr(0, hostname.length - domain.length - 1);
};
