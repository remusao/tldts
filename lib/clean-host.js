
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


/**
 * @see https://github.com/oncletom/tld.js/issues/95
 *
 * @param {string} value
 */
function trimTrailingDots(value) {
  if (value[value.length - 1] === '.') {
    return value.substr(0, value.length - 1);
  }
  return value;
}


/**
 * Fast check to avoid calling `trim` when not needed.
 *
 * @param {string} value
 */
function checkTrimmingNeeded(value) {
  return (
    value.length > 0 && (
      value.charCodeAt(0) <= 32 ||
      value.charCodeAt(value.length - 1) <= 32
    )
  );
}


/**
 * Fast check to avoid calling `toLowerCase` when not needed.
 *
 * @param {string} value
 */
function checkLowerCaseNeeded(value) {
  for (var i = 0; i < value.length; i += 1) {
    var code = value.charCodeAt(i);
    if (code >= 65 && code <= 90) { // [A-Z]
      return true;
    }
  }

  return false;
}


module.exports = function extractHostname(value) {
  // First check if `value` is already a valid hostname.
  if (isValid(value)) {
    return trimTrailingDots(value);
  }

  var url = value;

  if (typeof url !== 'string') {
    url = '' + url;
  }

  var needsTrimming = checkTrimmingNeeded(url);
  if (needsTrimming) {
    url = url.trim();
  }

  var needsLowerCase = checkLowerCaseNeeded(url);
  if (needsLowerCase) {
    url = url.toLowerCase();
  }

  // Try again after `url` has been transformed to lowercase and trimmed.
  if ((needsLowerCase || needsTrimming) && isValid(url)) {
    return trimTrailingDots(url);
  }

  // Proceed with heavier url parsing to extract the hostname.
  if (!hasPrefixRE.test(url)) {
    url = '//' + url;
  }

  var parts = URL.parse(url, null, true);

  if (parts.hostname) {
    return trimTrailingDots(parts.hostname);
  }

  return null;
};
