export function startsWith(str: string, prefix: string): boolean {
  if (str.length < prefix.length) {
    return false;
  }

  const ceil = prefix.length;
  for (let i = 0; i < ceil; i += 1) {
    if (str[i] !== prefix[i]) {
      return false;
    }
  }

  return true;
}

export function startsWithFrom(
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
