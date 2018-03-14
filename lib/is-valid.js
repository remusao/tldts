'use strict';


/**
 * Check if the code point is a digit [0-9]
 *
 * @param {number} code
 * @return boolean
 */
function isDigit(code) {
  // 48 == '0'
  // 57 == '9'
  return code >= 48 && code <= 57;
}


/**
 * Check if the code point is a letter [a-zA-Z]
 *
 * @param {number} code
 * @return boolean
 */
function isAlpha(code) {
  // 97 === 'a'
  // 122 == 'z'
  return code >= 97 && code <= 122;
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
module.exports = function isValid(hostname) {
  if (typeof hostname !== 'string') {
    return false;
  }

  if (hostname.length > 255) {
    return false;
  }

  if (hostname.length === 0) {
    return false;
  }

  // Check first character: [a-zA-Z0-9]
  var firstCharCode = hostname.charCodeAt(0);
  if (!(isAlpha(firstCharCode) || isDigit(firstCharCode))) {
    return false;
  }

  // Validate hostname according to RFC
  var lastDotIndex = -1;
  var lastCharCode;
  var code;
  var len = hostname.length;

  for (var i = 0; i < len; i += 1) {
    code = hostname.charCodeAt(i);

    if (code === 46) { // '.'
      if (
        // Check that previous label is < 63 bytes long (64 = 63 + '.')
        (i - lastDotIndex) > 64 ||
        // Check that previous character was not already a '.'
        lastCharCode === 46 ||
        // Check that the previous label does not end with a '-'
        lastCharCode === 45
      ) {
        return false;
      }

      lastDotIndex = i;
    } else if (!(isAlpha(code) || isDigit(code) || code === 45)) {
      // Check if there is a forbidden character in the label: [^a-zA-Z0-9-]
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
};
