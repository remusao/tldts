import { shareSameDomainSuffix } from '../domain';
import { IOptions } from '../options';
import { IPublicSuffix } from './interface';

/**
 * Apply `options.extraSuffixes` to the built-in lookup result in `out`, as if
 * they were part of the list (`isException`: the built-in winner is an
 * exception rule). As in browsers, the longest match prevails and an exception
 * beats a rule of the same length. Remaining ties go to the built-in match
 * (unless it matched no rule: both flags falsy), then to `icann`.
 */
export default function extraSuffixLookup(
  hostname: string,
  options: IOptions,
  isException: boolean,
  out: IPublicSuffix,
): void {
  const suffix = out.publicSuffix;
  if (suffix === null) {
    return;
  }

  // Best extra exception and rule, as start indices in `hostname` (smaller is
  // longer; `none` if unmatched), and whether each is ICANN.
  const none = hostname.length + 1;
  let exception = none;
  let exceptionIsIcann = false;
  let rule = none;
  let ruleIsIcann = false;
  const extra = options.extraSuffixes!;
  for (let section = 0; section < 2; section += 1) {
    const isIcann = section === 0;
    const rules = isIcann
      ? options.allowIcannDomains && extra.icann
      : options.allowPrivateDomains && extra.private;
    if (!Array.isArray(rules)) {
      continue;
    }
    for (const r of rules) {
      // Sparse or untyped lists may hold non-strings.
      if (typeof r !== 'string') {
        continue;
      }
      const exceptionRule = r.startsWith('!');
      const wildcard = r.startsWith('*.');
      const body = exceptionRule ? r.slice(1) : wildcard ? r.slice(2) : r;
      // Skip empty rules, and exceptions without a parent ('!p').
      if (
        body === '' ||
        (exceptionRule && !body.includes('.')) ||
        !shareSameDomainSuffix(hostname, body)
      ) {
        continue;
      }
      let start = hostname.length - body.length;
      // Strict `<`: on a tie, the first match (`icann` first) wins.
      if (exceptionRule) {
        if (start < exception) {
          exception = start;
          exceptionIsIcann = isIcann;
        }
        continue;
      }
      // `*.p` also matches `p`, else one more non-empty label.
      if (wildcard && start > 1 && hostname.charCodeAt(start - 2) !== 46) {
        start = hostname.lastIndexOf('.', start - 2) + 1;
      }
      if (start < rule) {
        rule = start;
        ruleIsIcann = isIcann;
      }
    }
  }

  // Start of the built-in match: an exception starts one label left of its
  // suffix.
  const suffixStart = hostname.length - suffix.length;
  const builtin = isException
    ? hostname.lastIndexOf('.', suffixStart - 2) + 1
    : suffixStart;
  // An exception wins ties with rules; a built-in exception wins ties with
  // an extra one.
  if (
    exception <= rule &&
    (isException ? exception < builtin : exception <= builtin)
  ) {
    out.publicSuffix = hostname.slice(hostname.indexOf('.', exception) + 1);
    out.isIcann = exceptionIsIcann;
    out.isPrivate = !exceptionIsIcann;
  } else if (
    rule < builtin ||
    (rule === builtin && !out.isIcann && !out.isPrivate)
  ) {
    out.publicSuffix = hostname.slice(rule);
    out.isIcann = ruleIsIcann;
    out.isPrivate = !ruleIsIcann;
  }
}
