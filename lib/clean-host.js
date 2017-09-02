
var URL = require('url');
var isValid = require('./is-valid.js');


/**
 * Utility to cleanup the base host value. Also removes url fragments.
 *
 * Works for:
 * - hostname
 * - //hostname
 * - scheme://hostname
 * - scheme+scheme://hostname
 *
 * @param {string} value
 * @return {String}
 */

// scheme      = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
var hasPrefixRE = /^(([a-z][a-z0-9+.-]*)?:)?\/\//;
var invalidHostnameChars = /[^A-Za-z0-9.-]/;

// @see https://github.com/oncletom/tld.js/issues/95
function rtrim(value) {
  if (value[value.length - 1] === '.') {
    return value.substr(0, value.length - 1);
  }
  return value;
}

module.exports = function extractHostname(validHosts, value) {
  if (isValid(validHosts, value)) {
    return rtrim(value);
  }

  var url = ('' + value).toLowerCase().trim();

  if (isValid(validHosts, url)) {
    return rtrim(url);
  }

  // Proceed with heavier url parsing to extract the hostname.
  var parts = URL.parse(hasPrefixRE.test(url) ? url : '//' + url, null, true);

  if (parts.hostname && !invalidHostnameChars.test(parts.hostname)) {
    return rtrim(parts.hostname);
  } else if (!invalidHostnameChars.test(url)) {
    return rtrim(url);
  }

  return null;
};
