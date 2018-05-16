'use strict';


var extractTldFromHost = require('./from-host.js');


/**
 * Returns the public suffix (including exact matches)
 *
 * @api
 * @since 1.5
 * @param {string} hostname
 * @return {string}
 */
module.exports = function getPublicSuffix(rules, hostname, options) {
  // First check if `hostname` is already a valid top-level Domain.
  if (rules.hasTld(hostname)) {
    return {
      publicSuffix: hostname,
      isIcann: false,
      isPrivate: false,
    };
  }

  var candidate = rules.suffixLookup(hostname, options);
  if (candidate === null) {
    // Prevailing rule is '*' so we consider the top-level domain to be the
    // public suffix of `hostname` (e.g.: 'example.org' => 'org').
    return {
      isIcann: false,
      isPrivate: false,
      publicSuffix: extractTldFromHost(hostname),
    };
  }

  return candidate;
};
