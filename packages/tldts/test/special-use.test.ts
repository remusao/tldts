import { expect } from 'chai';
import 'mocha';

import { parse } from '../index';

// Mirrors SPECIAL_USE_DOMAINS in tldts-core/src/is-special-use.ts. Kept here as
// an explicit expectation: adding or removing a special-use name should prompt
// re-checking its Public Suffix List overlap (asserted below).
const SPECIAL_USE_DOMAINS = [
  'test',
  'localhost',
  'invalid',
  'example',
  'example.com',
  'example.net',
  'example.org',
  'local',
  'onion',
  'alt',
  'home.arpa',
  'ipv4only.arpa',
  'resolver.arpa',
  'service.arpa',
  '6tisch.arpa',
  'eap.arpa',
];

describe('special-use domains vs the Public Suffix List', () => {
  // The feature exists precisely because special-use status is *orthogonal* to
  // the PSL: `isSpecialUse` must flag these names whether or not they happen to
  // be public suffixes.
  it('flags special-use names independently of PSL membership', () => {
    // `localhost` is not a public suffix (no PSL rule -> isIcann false)...
    const localhost = parse('dev.localhost', { detectSpecialUse: true });
    expect(localhost.isIcann, 'localhost isIcann').to.equal(false);
    expect(localhost.isSpecialUse, 'localhost isSpecialUse').to.equal(true);

    // ...whereas `onion` (RFC 7686) and `home.arpa` (RFC 8375) *are* in the
    // PSL's ICANN section, so isIcann is true -- isSpecialUse still flags them.
    const onion = parse('facebookcorewwwwi.onion', { detectSpecialUse: true });
    expect(onion.isIcann, 'onion isIcann').to.equal(true);
    expect(onion.isSpecialUse, 'onion isSpecialUse').to.equal(true);

    const homeArpa = parse('router.home.arpa', { detectSpecialUse: true });
    expect(homeArpa.isIcann, 'home.arpa isIcann').to.equal(true);
    expect(homeArpa.isSpecialUse, 'home.arpa isSpecialUse').to.equal(true);
  });

  // Lock the overlap against the bundled (real) PSL data: a special-use name is
  // itself a public suffix only when its publicSuffix is the whole name AND that
  // match came from a real rule (isIcann/isPrivate), not the "*" fallback. Only
  // `onion` and `home.arpa` qualify. If a PSL update changes this, the test
  // fails so the docs and rationale can be revisited.
  it('overlaps the Public Suffix List only at onion and home.arpa', () => {
    const inPsl = SPECIAL_USE_DOMAINS.filter((name) => {
      const r = parse(name, { allowPrivateDomains: true });
      return (
        r.publicSuffix === name && (r.isIcann === true || r.isPrivate === true)
      );
    });
    expect(inPsl.sort()).to.deep.equal(['home.arpa', 'onion']);
  });
});
