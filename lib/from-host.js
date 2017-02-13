/**
 * Utility to extract the TLD from a host string
 *
 * @param {string} host
 * @return {String}
 */
module.exports = function extractTldFromHost(host){
  return host.split('.').pop();
};
