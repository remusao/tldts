'use strict';


/**
 * Check if a hostname is an IP. You should be aware that this only works
 * because `hostname` is already garanteed to be a valid hostname!
 *
 * @param {string} hostname
 * @return {boolean}
 */
function isProbablyIpv4(hostname) {
  var numberOfDots = 0;

  for (var i = 0; i < hostname.length; i += 1) {
    var code = hostname.charCodeAt(i);

    if (code === 46) { // '.'
      numberOfDots += 1;
    } else if (code < 48 || code > 57) {
      // 48 => '0'
      // 57 => '9'
      return false;
    }
  }

  return (
    numberOfDots === 3  &&
    hostname[0] !== '.' &&
    hostname[hostname.length - 1] !== '.'
  );
}


/**
 * Similar to isProbablyIpv4.
 *
 * @param {string} hostname
 * @return {boolean}
 */
function isProbablyIpv6(hostname) {
  var hasColon = false;

  for (var i = 0; i < hostname.length; i += 1) {
    var code = hostname.charCodeAt(i);

    if (code === 58) { // ':'
      hasColon = true;
    } else if (!(
      (code >= 48 && code <= 57) || // 0-9
      (code >= 97 && code <= 102)   // a-f
    )) {
      return false;
    }
  }

  return hasColon;
}


/**
 * Check if `hostname` is *probably* a valid ip addr (either ipv6 or ipv4).
 * This *will not* work on any string. We need `hostname` to be a valid
 * hostname.
 *
 * @param {string} hostname
 * @return {boolean}
 */
module.exports = function isIp(hostname) {
  if (typeof hostname !== 'string') {
    return false;
  }

  if (hostname.length === 0) {
    return false;
  }

  return (isProbablyIpv6(hostname) || isProbablyIpv4(hostname));
};
