/**
 * Checking if a host string is valid
 * It's usually a preliminary check before trying to use getDomain or anything else
 *
 * Beware: it does not check if the TLD exists.
 *
 * @api
 * @param host {String}
 * @return {Boolean}
 */
module.exports = function isValid (validHosts, host) {
  return typeof host === 'string' && (validHosts.indexOf(host) !== -1 || (host.indexOf('.') !== -1 && host[0] !== '.'));
};
