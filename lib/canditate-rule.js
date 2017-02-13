var some = require('./polyfills/array-some.js');

/**
 * Returns the best rule for a given host based on candidates
 *
 * @static
 * @param host {String} Hostname to check rules against
 * @param rules {Array} List of rules used to work on
 * @return {Object} Candidate object, with a normal and exception state
 */
module.exports = function getCandidateRule (host, rules, options) {
  var rule = {'normal': null, 'exception': null};

  options = options || { lazy: false };

  some(rules, function (r) {
    var pattern;

    // sld matching or validHost? escape the loop immediately (except if it's an exception)
    if ('.' + host === r.getNormalXld()) {
      if (options.lazy || r.exception || r.isHost) {
        rule.normal = r;
      }

      return true;
    }

    // otherwise check as a complete host
    // if it's an exception, we want to loop a bit more to a normal rule
    pattern = '.+' + r.getNormalPattern() + '$';

    if ((new RegExp(pattern)).test(host)) {
      rule[r.exception ? 'exception' : 'normal'] = r;
      return !r.exception;
    }

    return false;
  });

  // favouring the exception if encountered
  // previously we were copy-altering a rule, creating inconsistent results based on rule order order
  // @see https://github.com/oncletom/tld.js/pull/35
  if (rule.normal && rule.exception) {
    return rule.exception;
  }

  return rule.normal;
};
