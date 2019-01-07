/**
 * @param url - URL we want to extract a hostname from.
 * @param urlIsValidHostname - hint from caller; true if `url` is already a valid hostname.
 */
export default function extractHostname(
  url: string,
  urlIsValidHostname: boolean,
): string | null {
  let start = 0;
  let end = url.length;

  // If url is not already a valid hostname, then try to extract hostname.
  if (urlIsValidHostname === false) {
    // Trim leading spaces
    while (start < url.length && url.charCodeAt(start) <= 32) {
      start += 1;
    }

    // Trim trailing spaces
    while (end > start + 1 && url.charCodeAt(end - 1) <= 32) {
      end -= 1;
    }

    // Skip scheme.
    if (url.charCodeAt(start) === 47 && url.charCodeAt(start + 1) === 47) {
      // check if url starts with '//'
      start += 2;
    } else {
      const indexOfProtocol = url.indexOf('://', start);
      if (indexOfProtocol !== -1) {
        start = indexOfProtocol + 3;

        // Check that scheme is valid
        for (let i = 0; i < indexOfProtocol; i += 1) {
          const lowerCaseCode = url.charCodeAt(i) | 32;
          if (
            ((lowerCaseCode >= 97 && lowerCaseCode <= 122) || // [a, z]
            (lowerCaseCode >= 48 && lowerCaseCode <= 57) || // [0, 9]
            lowerCaseCode === 46 || // '.'
            lowerCaseCode === 45 || // '-'
              lowerCaseCode === 43) === false // '+'
          ) {
            return null;
          }
        }
      }
    }

    // Detect first occurrence of '/', '?' or '#'. We also keep track of the last
    // occurrence of '@', ']' or ':' to speed-up subsequent parsing of
    // (respectively), identifier, ipv6 or port.
    let indexOfIdentifier = -1;
    let indexOfClosingBracket = -1;
    let indexOfPort = -1;
    for (let i = start; i < end; i += 1) {
      const code = url.charCodeAt(i);
      if (
        code === 35 || // '#'
        code === 47 || // '/'
        code === 63 // '?'
      ) {
        end = i;
        break;
      } else if (code === 64) {
        // '@'
        indexOfIdentifier = i;
      } else if (code === 93) {
        // ']'
        indexOfClosingBracket = i;
      } else if (code === 58) {
        // ':'
        indexOfPort = i;
      }
    }

    // Detect identifier: '@'
    if (
      indexOfIdentifier !== -1 &&
      indexOfIdentifier > start &&
      indexOfIdentifier < end
    ) {
      start = indexOfIdentifier + 1;
    }

    // Handle ipv6 addresses
    if (url.charCodeAt(start) === 91) {
      // '['
      if (indexOfClosingBracket !== -1) {
        return url.slice(start + 1, indexOfClosingBracket).toLowerCase();
      }
      return null;
    } else if (indexOfPort !== -1 && indexOfPort > start && indexOfPort < end) {
      // Detect port: ':'
      end = indexOfPort;
    }
  }

  // Trim trailing dots
  while (end > start + 1 && url.charCodeAt(end - 1) === 46) {
    // '.'
    end -= 1;
  }

  return (start !== 0 || end !== url.length
    ? url.slice(start, end)
    : url
  ).toLowerCase();
}
