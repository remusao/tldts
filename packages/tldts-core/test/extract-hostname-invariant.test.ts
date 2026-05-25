import { expect } from 'chai';
import 'mocha';

import extractHostname, {
  extractedHostnameValidated,
} from '../src/extract-hostname';
import isValidHostname from '../src/is-valid';

// SAFETY-INVARIANT guard for the extract/validate fusion.
//
// When `extractHostname` publishes `extractedHostnameValidated === true`,
// `factory.ts` SKIPS the separate `isValidHostname` pass and trusts the returned
// host as valid. The fusion is therefore correct only if that flag is NEVER set
// for a host `isValidHostname` would reject — a "wrong-accept" would let an
// invalid host through. The inline validation in `extract-hostname.ts`
// deliberately duplicates `is-valid.ts`'s rules; this deterministic fuzz ties
// the two together so any future drift (in either file) is caught here.
describe('#extractHostname fusion invariant: flag ⟹ isValidHostname', () => {
  // mulberry32 — tiny deterministic PRNG so the fuzz is reproducible in CI.
  const makeRand = (seed: number) => (): number => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  it('never flags a host that isValidHostname rejects (60k seeded cases)', function () {
    this.timeout(20000);
    // Adversarial alphabet: valid host chars + delimiters + odd ASCII + unicode.
    const adversarial =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_:@[]/?#\\ %!~`{}éü中'.split(
        '',
      );
    // Label-ish chars for "structured" hosts that reliably hit the fast path.
    const structured = 'abcdefghijklmnopqrstuvwxyz0123456789-.'.split('');
    const rand = makeRand(0x9e3779b9);
    const pick = (arr: string[]): string => arr[(rand() * arr.length) | 0]!;

    let flagged = 0;
    let wrongAccepts = 0;
    let firstFailure = '';

    for (let k = 0; k < 60000; k += 1) {
      // Half adversarial (mostly invalid), half structured (mostly valid) so the
      // fast path is exercised heavily AND odd inputs are probed.
      const pool = k % 2 === 0 ? adversarial : structured;
      const n = 1 + ((rand() * 40) | 0);
      let s = '';
      for (let i = 0; i < n; i += 1) s += pick(pool);
      // Exercise both the bare-host extraction path and the scheme/URL path.
      if (k % 3 === 0) s = 'http://' + s + '/p';

      const host = extractHostname(s, false, true);
      if (extractedHostnameValidated) {
        flagged += 1;
        // The flag promised the returned host is valid — isValidHostname must agree.
        if (host === null || !isValidHostname(host)) {
          wrongAccepts += 1;
          if (firstFailure === '') {
            firstFailure = `input=${JSON.stringify(s)} host=${JSON.stringify(
              host,
            )}`;
          }
        }
      }
    }

    expect(wrongAccepts, `wrong-accept(s); first: ${firstFailure}`).to.equal(0);
    // Guard against a vacuous pass: the fuzz must actually hit the fast path.
    expect(flagged).to.be.greaterThan(500);
  });
});
