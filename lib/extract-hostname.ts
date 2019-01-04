function startsWithFrom(
  haystack: string,
  needle: string,
  start: number,
): boolean {
  if (haystack.length - start < needle.length) {
    return false;
  }

  const ceil = start + needle.length;
  for (let i = start; i < ceil; i += 1) {
    if (haystack[i] !== needle[i - start]) {
      return false;
    }
  }

  return true;
}

const enum CHARACTERS {
  A = 97, // 'a'
  AT = 64, // '@'
  CLOSE_BRACKET = 93, // ']'
  COLON = 58, // ':'
  DASH = 45, // '-'
  DOT = 46, // '.'
  NINE = 57, // '9'
  OPEN_BRACKET = 91, // '['
  PLUS = 43, // '+'
  QUESTION_MARK = 63, // '?'
  SHARP = 35, // '#'
  SLASH = 47, // '/'
  Z = 122, // 'z'
  ZERO = 48, // '0'
}

export default function extractHostname(url: string): string | null {
  let start = 0;
  let end = url.length;

  // Trim leading and trailing spaces
  while (start < url.length && url.charCodeAt(start) <= 32) {
    start += 1;
  }

  while (end > start + 1 && url.charCodeAt(end - 1) <= 32) {
    end -= 1;
  }

  // Skip scheme.
  if (startsWithFrom(url, '//', start)) {
    start += 2;
  } else {
    const indexOfProtocol = url.indexOf('://', start);
    if (indexOfProtocol !== -1) {
      start = indexOfProtocol + 3;

      // Check that scheme is valid
      for (let i = 0; i < indexOfProtocol; i += 1) {
        const lowerCaseCode = url.charCodeAt(i) | 32;
        if (
          !(
            (lowerCaseCode >= CHARACTERS.A && lowerCaseCode <= CHARACTERS.Z) || // alpha
            (lowerCaseCode >= CHARACTERS.ZERO &&
              lowerCaseCode <= CHARACTERS.NINE) || // digit
            lowerCaseCode === CHARACTERS.DOT || // '.'
            lowerCaseCode === CHARACTERS.DASH || // '-'
            lowerCaseCode === CHARACTERS.PLUS
          ) // '+'
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
      code === CHARACTERS.SHARP || // '#'
      code === CHARACTERS.SLASH || // '/'
      code === CHARACTERS.QUESTION_MARK // '?'
    ) {
      end = i;
      break;
    } else if (code === CHARACTERS.AT) {
      // '@'
      indexOfIdentifier = i;
    } else if (code === CHARACTERS.CLOSE_BRACKET) {
      // ']'
      indexOfClosingBracket = i;
    } else if (code === CHARACTERS.COLON) {
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
  if (url.charCodeAt(start) === CHARACTERS.OPEN_BRACKET) {
    if (indexOfClosingBracket !== -1) {
      return url.slice(start + 1, indexOfClosingBracket);
    }
    return null;
  } else if (indexOfPort !== -1 && indexOfPort > start && indexOfPort < end) {
    // Detect port: ':'
    end = indexOfPort;
  }

  // Trim trailing dots
  while (end > start + 1 && url.charCodeAt(end - 1) === CHARACTERS.DOT) {
    end -= 1;
  }

  // Return subset corresponding to hostname
  if (start !== 0 || end !== url.length) {
    return url.slice(start, end);
  }

  return url;
}
