
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
