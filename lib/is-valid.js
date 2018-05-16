'use strict';

var isValidIDNA = require('./idna.js');


function containsUnderscore(hostname) {
  return hostname.indexOf('_') !== -1;
}


function isValidHostname(hostname) {
  if (typeof hostname !== 'string') {
    return false;
  }

  if (hostname.length > 255) {
    return false;
  }

  if (hostname.length === 0) {
    return false;
  }

  // Check first character
  var firstCharCode = hostname.codePointAt(0);
  if (!isValidIDNA(firstCharCode)) {
    return false;
  }

  // Validate hostname according to RFC
  var lastDotIndex = -1;
  var lastCharCode;
  var code;
  var len = hostname.length;

  for (var i = 0; i < len; i += 1) {
    code = hostname.codePointAt(i);

    if (code === 46) { // '.'
      if (
        // Check that previous label is < 63 bytes long (64 = 63 + '.')
        (i - lastDotIndex) > 64 ||
        // Check that previous character was not already a '.'
        lastCharCode === 46 ||
        // Check that the previous label does not end with a '-'
        lastCharCode === 45 ||
        // Check that the previous label does not end with a '_'
        lastCharCode === 95
      ) {
        return false;
      }

      lastDotIndex = i;
    } else if (!(isValidIDNA(code) || code === 45 || code === 95)) {
      // Check if there is a forbidden character in the label
      return false;
    }

    lastCharCode = code;
  }

  return (
    // Check that last label is shorter than 63 chars
    (len - lastDotIndex - 1) <= 63 &&
    // Check that the last character is an allowed trailing label character.
    // Since we already checked that the char is a valid hostname character,
    // we only need to check that it's different from '-'.
    lastCharCode !== 45
  );

}

/**
 * Check if a hostname string is valid (according to RFC). It's usually a
 * preliminary check before trying to use getDomain or anything else.
 *
 * Beware: it does not check if the TLD exists.
 *
 * @api
 * @param {string} hostname
 * @return {boolean}
 */
module.exports = function (hostname, options) {
  return (
    isValidHostname(hostname) && (
      options.strictHostnameValidation === false || !containsUnderscore(hostname)
    )
  );
};
