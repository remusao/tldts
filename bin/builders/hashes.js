/**
 * This builder implements a probabilistic data-structure to store the public
 * suffixes from Mozilla's 'publicsuffix' project. The goals are:
 *
 *   1. Allow storing the parsed rules in a very compact form (<30KB)
 *   2. Allow super fast load time with no parsing required (typed array)
 *   2. Super fast lookup times (~2M+ per second)
 *
 * These are achieved by hashing each available suffix as a 32bits number and
 * storing them in a typed array which is bundled in the library itself. This
 * way the only cost of loading the rules is paid by the JavaScript engine
 * loading the source and the size of the rules is ~29KB. Matching is also
 * extremely fast, at around 2M+ lookups per second.
 *
 * **WARNING**: The drawback of this structure is that, because we use hashes of
 * suffixes instead of their initial values, there can be collisions (think
 * bloom filters). Some future work involves estimating the probability of
 * collisions. Only use this structure if you are fine with this limitation and
 * need the most compact/fast data structure available.
 *
 * Data Structure
 * ==============
 *
 * The basic idea behind the packed hashes structure is that suffixes will be
 * grouped by number of labels then hashed to 32bits integers using a fast
 * hashing function. For examples:
 *
 *  1 label:
 *    com   -> hash(com)
 *    fr    -> hash(fr)
 *    gov   -> hash(gov)
 *  2 labels:
 *    co.uk -> hash(co.uk)
 *
 * Then the hashes are organized in a typed array from least number of labels to
 * most number of labels, and in each section, hashes are sorted so that we can
 * perform lookups using a binary search:
 *
 * |#1 length|suffix 1|suffix 2|...|#2 length|suffix 1|suffix 2|...|...
 *  ^                               ^ number of suffixes with 2 labels
 *  | number of suffix with 1 label
 *
 *  In the example above:
 *
 *    3|hash(com)|hash(fr)|hash(gov)|1|hash(co.uk)
 *    ^                              ^ we have on suffix with 2 labels (co.uk)
 *    | we have 3 suffixes with one label
 *
 * In practice, the data-structure is slightly more complex as we have to handle
 * the ICANN and PRIVATE sections of the list separately (which allows to pick
 * one or the other at runtime; or both, which is the default) as well as
 * wildcards and exceptions rules. The structure looks more like:
 *
 *  |icann exceptions|private exceptions|icann wildcards|private wildcards|icann rules|private rules
 *
 *  Still ordered from least number of labels to most number of labels. This
 *  allows the matching to be a forward progression from beginning to end,
 *  potentially skipping some sections (e.g.: private) by just incrementing the
 *  index.
 *
 * Finding a Match
 * ===============
 *
 * Finding a match can be done efficiently, without any string copy and by a
 * single pass over the input (from end to beginning). The algorithm is as
 * follows:
 *
 * - For each character `c` in hostname, from end to start:
 *     1. If `c` is '.' then we reached the end of a label:
 *         * Use a binary search in the section containing suffixes of the same
 *           size as our current label to check if our hash is there.
 *         * Move forward to the next section by incrementing the index by the
 *           number of suffixes in this section.
 *     2. Update the hash with the current character
 *
 * This does not account for wildcards and exceptions, but explains the general
 * idea of the matching algorithm. Have a look at the source bellow for more
 * details.
 *
 * Some nice properties of this algorithm:
 * 1. Pretty straight-forward implementation
 * 2. Matching is always going forward in the array
 * 3. Sections can be skipped by just incrementing the index
 * 4. Hash can be computed on-the-fly from end to start without any string copy
 */

const parse = require('../parser');

/**
 * Compute 32 bits hash of `str` backward.
 */
function fastHash(str) {
  let hash = 5381;
  for (let j = str.length - 1; j >= 0; j -= 1) {
    hash = (hash * 33) ^ str.charCodeAt(j);
  }
  return hash >>> 0;
}

/**
 * Build packed typed array given the raw public list as a string.
 */
module.exports = (body) => {
  const rules = {
    icann: [],
    priv: [],
  };
  const wildcards = {
    icann: [],
    priv: [],
  };
  const exceptions = {
    icann: [],
    priv: [],
  };

  // Keep track of maximum number of labels seen in a given rule. This allows us
  // to make sure that all sections of the typed array (wildcards, exceptions
  // and normal rules) have the same size and we do not need to check that while
  // matching.
  let maximumNumberOfLabels = 0;

  // Iterate on public suffix rules
  parse(body, ({
    rule,
    isIcann,
    isException,
    isWildcard,
    isNormal,
  }) => {
    // Select correct section to insert the rule
    let hashesPerLabels = null;
    if (isException) {
      hashesPerLabels = isIcann ? exceptions.icann : exceptions.priv;
    } else if (isWildcard) {
      hashesPerLabels = isIcann ? wildcards.icann : wildcards.priv;
      // eslint-disable-next-line no-param-reassign
      rule = rule.slice(2);
    } else if (isNormal) {
      hashesPerLabels = isIcann ? rules.icann : rules.priv;
    }

    // Count number of labels in this suffix
    const numberOfLabels = rule.split('.').length;

    // Experimentally, we start ignoring suffixes with only one label since the
    // fallback to '*' will yield the same result. This helps reduce the size of
    // the bundle further and speed-up matching. One potential side-effect is
    // that we might not accurately return the information about if a suffix is
    // from the ICANN or PRIVATE section.
    if (
      numberOfLabels === 1 &&
      (hashesPerLabels === rules.icann || hashesPerLabels === rules.priv)
    ) {
      return;
    }

    maximumNumberOfLabels = Math.max(maximumNumberOfLabels, numberOfLabels);
    if (hashesPerLabels[numberOfLabels] === undefined) {
      hashesPerLabels[numberOfLabels] = [];
    }

    hashesPerLabels[numberOfLabels].push(fastHash(rule));
  });

  // Pack everything together
  const chunks = [];
  const pushHashes = (hashes = []) => {
    chunks.push([
      hashes.length,
      ...hashes.sort((a, b) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      }),
    ]);
  };

  for (let label = 1; label <= maximumNumberOfLabels; label += 1) {
    pushHashes(exceptions.icann[label]);
    pushHashes(exceptions.priv[label]);
    pushHashes(wildcards.icann[label]);
    pushHashes(wildcards.priv[label]);
    pushHashes(rules.icann[label]);
    pushHashes(rules.priv[label]);
  }

  return new Uint32Array([maximumNumberOfLabels, ...[].concat(...chunks)]);
};
