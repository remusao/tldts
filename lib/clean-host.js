var URL = require('url');

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

function trim(value) {
  return String(value).replace(/(^\s+|\s+$)/g, '');
}

module.exports = function cleanHostValue(value){
  value = trim(value).toLowerCase();

  var parts = URL.parse(hasPrefixRE.test(value) ? value : '//' + value, null, true);

  if (parts.hostname && !invalidHostnameChars.test(parts.hostname)) { return parts.hostname; }
  if (!invalidHostnameChars.test(value)) { return value; }
  return '';
};
