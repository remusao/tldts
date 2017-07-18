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

//@see https://github.com/oncletom/tld.js/issues/95
function rtrim(value) {
  return String(value).replace(/[.]+$/g, '');
}

module.exports = function cleanHostValue(value){
  value = String(value).trim().toLowerCase();

  var parts = URL.parse(hasPrefixRE.test(value) ? value : '//' + value, null, true);

  if (parts.hostname && !invalidHostnameChars.test(parts.hostname)) { return rtrim(parts.hostname); }
  if (!invalidHostnameChars.test(value)) { return rtrim(value); }
  return '';
};
