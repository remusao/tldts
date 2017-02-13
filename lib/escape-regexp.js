/**
 * Escapes RegExp specific chars.
 *
 * @since 1.3.1
 * @see https://github.com/oncletom/tld.js/pull/33
 * @param {String|Mixed} s
 * @returns {string} Escaped string for a safe use in a `new RegExp` expression
 */
module.exports = function escapeRegExp(s) {
  return String(s).replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};
