import {
  fastPathLookup,
  IPublicSuffix,
  ISuffixLookupOptions,
} from 'tldts-core';
import packed from './data/hashes';

/**
 * Find `elt` in `arr` between indices `start` (included) and `end` (excluded)
 * using a binary search algorithm.
 */
function binSearch(
  arr: Uint32Array,
  elt: number,
  start: number,
  end: number,
): boolean {
  if (start >= end) {
    return false;
  }

  let low = start;
  let high = end - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const midVal = arr[mid];
    if (midVal < elt) {
      low = mid + 1;
    } else if (midVal > elt) {
      high = mid - 1;
    } else {
      return true;
    }
  }

  return false;
}

// Packed hash algorithm makes use of a rolling hash to lookup suffixes. To
// avoid having to allocate an array to store them at every invocation, we
// create one global one that can be reused.
const BUFFER = new Uint32Array(20);

/**
 * Iterate on hashes of labels from `hostname` backward (from last label to
 * first label), stopping after `maximumNumberOfLabels` have been extracted and
 * calling `cb` on each of them.
 *
 * The `maximumNumberOfLabels` argument is typically used to specify the number
 * of labels seen in the longest public suffix. We do not need to check further
 * in very long hostnames.
 */
function hashHostnameLabelsBackward(
  hostname: string,
  maximumNumberOfLabels: number,
): number {
  let hash = 5381;
  let index = 0;

  // Compute hash backward, label per label
  for (let i = hostname.length - 1; i >= 0; i -= 1) {
    const code = hostname.charCodeAt(i);
    // Process label
    if (code === 46 /* '.' */) {
      BUFFER[index << 1] = hash >>> 0;
      BUFFER[(index << 1) + 1] = i + 1;
      index += 1;

      if (index === maximumNumberOfLabels) {
        return index;
      }
    }

    // Update hash
    hash = (hash * 33) ^ code;
  }

  // Let's not forget about last label
  BUFFER[index << 1] = hash >>> 0;
  BUFFER[(index << 1) + 1] = 0;
  index += 1;

  return index;
}

const enum Result {
  NO_MATCH = 0,
  ICANN_MATCH = 1,
  PRIVATE_MATCH = 2,
  EXCEPTION_MATCH = 4,
  NORMAL_MATCH = 8,
  WILDCARD_MATCH = 16,
}

/**
 * Perform a public suffix lookup for `hostname` using the packed hashes
 * data-structure. The `options` allows to specify if ICANN/PRIVATE sections
 * should be considered. By default, both are.
 *
 */
export default function suffixLookup(
  hostname: string,
  options: ISuffixLookupOptions,
  out: IPublicSuffix,
): void {
  if (fastPathLookup(hostname, options, out) === true) {
    return;
  }

  const { allowIcannDomains, allowPrivateDomains } = options;

  // Keep track of longest match
  let matchIndex = -1;
  let matchKind = Result.NO_MATCH;
  let matchLabels = 0; // Keep track of number of labels currently matched

  // Index in the packed array data-structure
  let index = 1;

  const numberOfHashes = hashHostnameLabelsBackward(
    hostname,
    packed[0] /* maximumNumberOfLabels */,
  );

  for (let label = 0; label < numberOfHashes; label += 1) {
    const hash = BUFFER[label << 1];
    const labelStart = BUFFER[(label << 1) + 1];
    // For each label, matching proceeds in the following way:
    //
    //  1. check exceptions
    //  2. check wildcards
    //  3. check normal rules
    //
    // For each of these, we also perform the lookup in two parts, once for
    // the ICANN section and one for the PRIVATE section. Both of which are
    // optional and can be enabled/disabled using the `options` argument.
    //
    // We start with exceptions because if an exception is found, we do not
    // need to continue matching wildcards or normal rules; the exception will
    // always have priority.
    //
    // Similarly, if we find a wildcard match, we do not need to check the
    // rules for the same label as the wildcard match is always longer (one
    // more label is matched).
    //
    // **WARNING**: the structure of this code follows exactly the structure
    // of the packed data structure as create in ./bin/builders/hashes.js

    let match = Result.NO_MATCH;

    // ========================================================================
    // Lookup exceptions
    // ========================================================================
    // ICANN
    if (allowIcannDomains === true) {
      match = binSearch(packed, hash, index + 1, index + packed[index] + 1)
        ? Result.ICANN_MATCH | Result.EXCEPTION_MATCH
        : Result.NO_MATCH;
    }
    index += packed[index] + 1;

    // PRIVATE
    if (allowPrivateDomains === true && match === Result.NO_MATCH) {
      match = binSearch(packed, hash, index + 1, index + packed[index] + 1)
        ? Result.PRIVATE_MATCH | Result.EXCEPTION_MATCH
        : Result.NO_MATCH;
    }
    index += packed[index] + 1;

    // ========================================================================
    // Lookup wildcards
    // ========================================================================
    // ICANN
    if (
      allowIcannDomains === true &&
      match === Result.NO_MATCH &&
      (matchKind & Result.EXCEPTION_MATCH) === 0
    ) {
      match = binSearch(packed, hash, index + 1, index + packed[index] + 1)
        ? Result.WILDCARD_MATCH | Result.ICANN_MATCH
        : Result.NO_MATCH;
    }
    index += packed[index] + 1;

    // PRIVATE
    if (
      allowPrivateDomains === true &&
      match === Result.NO_MATCH &&
      (matchKind & Result.EXCEPTION_MATCH) === 0
    ) {
      match = binSearch(packed, hash, index + 1, index + packed[index] + 1)
        ? Result.WILDCARD_MATCH | Result.PRIVATE_MATCH
        : Result.NO_MATCH;
    }
    index += packed[index] + 1;

    // ========================================================================
    // Lookup rules
    // ========================================================================
    // ICANN
    if (
      allowIcannDomains === true &&
      match === Result.NO_MATCH &&
      (matchKind & Result.EXCEPTION_MATCH) === 0 &&
      matchLabels <= label
    ) {
      match = binSearch(packed, hash, index + 1, index + packed[index] + 1)
        ? Result.NORMAL_MATCH | Result.ICANN_MATCH
        : Result.NO_MATCH;
    }
    index += packed[index] + 1;

    // PRIVATE
    if (
      allowPrivateDomains === true &&
      match === Result.NO_MATCH &&
      (matchKind & Result.EXCEPTION_MATCH) === 0 &&
      matchLabels <= label
    ) {
      match = binSearch(packed, hash, index + 1, index + packed[index] + 1)
        ? Result.NORMAL_MATCH | Result.PRIVATE_MATCH
        : Result.NO_MATCH;
    }
    index += packed[index] + 1;

    // If we found a match, the longest match that is being tracked for this
    // hostname. We need to remember which kind of match it was (exception,
    // wildcard, normal rule), the index where the suffix starts in `hostname`
    // as well as the number of labels contained in this suffix (this is
    // important to make sure that we always keep the longest match if there
    // are both a wildcard and a normal rule matching).
    if (match !== Result.NO_MATCH) {
      matchKind = match;
      matchLabels = label + ((match & Result.WILDCARD_MATCH) !== 0 ? 2 : 1);
      matchIndex = labelStart;
    }
  }

  out.isIcann = (matchKind & Result.ICANN_MATCH) !== 0;
  out.isPrivate = (matchKind & Result.PRIVATE_MATCH) !== 0;

  // No match found
  if (matchIndex === -1) {
    out.publicSuffix =
      numberOfHashes === 1 ? hostname : hostname.slice(BUFFER[1]);
    return;
  }

  // If match is an exception, this means that we need to count less label.
  // For example, exception rule !foo.com would yield suffix 'com', so we need
  // to locate the next dot and slice from there.
  if ((matchKind & Result.EXCEPTION_MATCH) !== 0) {
    out.publicSuffix = hostname.slice(BUFFER[((matchLabels - 2) << 1) + 1]);
    return;
  }

  // If match is a wildcard, we need to match one more label. If wildcard rule
  // was *.com, we would have stored only 'com' in the packed structure and we
  // need to take one extra label on the left.
  if ((matchKind & Result.WILDCARD_MATCH) !== 0) {
    out.publicSuffix =
      matchLabels >= numberOfHashes
        ? hostname
        : hostname.slice(BUFFER[((matchLabels - 1) << 1) + 1]);
    return;
  }

  // if ((matchKind & Result.NORMAL_MATCH) !== 0)
  // For normal match, we just slice the hostname at the beginning of suffix.
  out.publicSuffix = hostname.slice(matchIndex);
}
