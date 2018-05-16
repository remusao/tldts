'use strict';

var isValidHostname = require('./is-valid.js');

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
function isTrimmingNeeded(value) {
  return (
    value.length > 0 && (
      value.charCodeAt(0) <= 32 ||
      value.charCodeAt(value.length - 1) <= 32
    )
  );
}


/**
 * Return `true` if `code` is a character which can be part of a scheme.
 */
function isSchemeChar(code) {
  var lowerCaseCode = code | 32;
  return (
    (lowerCaseCode >= 97 && lowerCaseCode <= 122) || // alpha
    (lowerCaseCode >= 48 && lowerCaseCode <= 57) || // digit
    lowerCaseCode === 46 || // '.'
    lowerCaseCode === 45 || // '-'
    lowerCaseCode === 43 // '+'
  );
}


module.exports = function (url, options) {
  if (typeof url !== 'string') {
    return '' + url;
  }

  // Trim spaces in `url` if needed.
  if (isTrimmingNeeded(url)) {
    url = url.trim();
  }

  // First check if `url` is already a valid hostname.
  if (isValidHostname(url, options)) {
    return trimTrailingDots(url).toLowerCase();
  }

  // Extract hostname
  var start = 0;
  var end = url.length;

  // Skip scheme.
  if (url.startsWith('//')) {
    start = 2;
  } else {
    var indexOfProtocol = url.indexOf('://');
    if (indexOfProtocol !== -1) {
      start = indexOfProtocol + 3;
      for (var i = 0; i < indexOfProtocol; i += 1) {
        if (!isSchemeChar(url.charCodeAt(i))) {
          // This is not a valid scheme
          start = 0;
          return null;
        }
      }
    }
  }

  // Detect first slash
  var indexOfSlash = url.indexOf('/', start);
  if (indexOfSlash !== -1) {
    end = indexOfSlash;
  }

  // Detect parameters: '?'
  var indexOfParams = url.indexOf('?', start);
  if (indexOfParams !== -1 && indexOfParams < end) {
    end = indexOfParams;
  }

  // Detect fragments: '#'
  var indexOfFragments = url.indexOf('#', start);
  if (indexOfFragments !== -1 && indexOfFragments < end) {
    end = indexOfFragments;
  }

  // Detect identifier: '@'
  var indexOfIdentifier = url.indexOf('@', start);
  if (indexOfIdentifier !== -1 && indexOfIdentifier < end) {
    start = indexOfIdentifier + 1;
  }

  // Detect port: ':'
  var indexOfPort = url.indexOf(':', start);
  if (indexOfPort !== -1 && indexOfPort < end) {
    end = indexOfPort;
  }

  // Handle ipv6 addresses
  if (url.charAt(start) === '[') {
    var indexOfClosingBracket = url.indexOf(']', start);
    if (indexOfClosingBracket !== -1) {
      return url.substring(start + 1, indexOfClosingBracket).toLowerCase();
    }
    return null;
  }

  return trimTrailingDots(url.substring(start, end)).toLowerCase();
};
