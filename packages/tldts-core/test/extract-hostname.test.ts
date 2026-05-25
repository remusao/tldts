import { expect } from 'chai';
import 'mocha';

import extractHostname, {
  extractedHostnameValidated,
} from '../src/extract-hostname';

// Direct unit tests for the hostname extractor, aiming at 100% branch coverage.
// extractHostname returns the RAW host substring (it does NOT run isIp or
// validateHostname — those live in factory.ts), so we assert the substring it
// isolates. Integrated `getHostname` behaviour and the WHATWG/WPT corpus are
// covered in tldts-tests. WHATWG references point at
// https://url.spec.whatwg.org/#concept-basic-url-parser.
const extract = (url: string, urlIsValidHostname = false): string | null =>
  extractHostname(url, urlIsValidHostname);

describe('#extractHostname', () => {
  it('returns the input unchanged when it is already a valid hostname', () => {
    // urlIsValidHostname=true: the whole extraction block is skipped and the
    // same string reference is returned (factory.ts relies on this).
    const input = 'example.com';
    expect(extract(input, true)).to.equal(input);
  });

  it('returns null for data: URLs', () => {
    expect(extract('data:text/plain,hello')).to.equal(null);
  });

  it('removes embedded tab / newline / carriage return (basic parser step 2)', () => {
    expect(extract('exa\tmple.com')).to.equal('example.com'); // bare host
    expect(extract('exa\nmple.com')).to.equal('example.com');
    expect(extract('exa\rmple.com')).to.equal('example.com');
    expect(extract('http://exa\tmple.com/')).to.equal('example.com'); // tab in authority
    expect(extract('http://exa\nmple.com/')).to.equal('example.com'); // newline in authority
    expect(extract('http://exa\rmple.com/')).to.equal('example.com'); // CR in authority
    expect(extract('htt\tp://example.com/')).to.equal('example.com'); // in scheme (":/" path)
  });

  it('keeps a non-tab/newline C0 control in the host (only U+0009/0A/0D are stripped)', () => {
    // Other C0 controls are not removed (they fail host validation downstream);
    // crucially the extractor must not loop trying to strip them.
    const input = 'http://a' + String.fromCharCode(1) + 'b.com';
    expect(extract(input)).to.equal('a' + String.fromCharCode(1) + 'b.com');
  });

  it('trims leading and trailing C0-or-space (basic parser step 1)', () => {
    expect(extract('   example.com  ')).to.equal('example.com');
  });

  it('handles a scheme-relative reference ("//host")', () => {
    expect(extract('//user@example.com/x')).to.equal('example.com');
  });

  it('handles a bare bracketed IPv6 literal (skips scheme detection)', () => {
    expect(extract('[::1]')).to.equal('::1');
  });

  it('lower-cases a bracketed IPv6 host', () => {
    expect(extract('http://[ABCD::1]:9/')).to.equal('abcd::1');
  });

  it('returns null when the IPv6 bracket is never closed', () => {
    expect(extract('http://[::1')).to.equal(null);
  });

  it('keeps a bare, unbracketed IPv6 literal whole (issue #2288)', () => {
    // A second ':' marks an unbracketed IPv6 (a host:port has exactly one), so
    // the trailing group must not be mistaken for a ':port' and trimmed.
    expect(extract('2a01:e35:2f22:e3d0::1')).to.equal('2a01:e35:2f22:e3d0::1');
    expect(extract('::1')).to.equal('::1');
    expect(extract('fe80::1')).to.equal('fe80::1');
    expect(extract('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.equal(
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    );
  });

  it('lower-cases a bare, unbracketed IPv6 literal', () => {
    expect(extract('2A01:E35::1')).to.equal('2a01:e35::1');
  });

  it('keeps an unbracketed IPv6 after a scheme, "//" or userinfo (issue #2288)', () => {
    expect(extract('http://2a01:e35:2f22:e3d0::1')).to.equal(
      '2a01:e35:2f22:e3d0::1',
    );
    expect(extract('//2a01::1')).to.equal('2a01::1');
    expect(extract('user:pass@2a01::1')).to.equal('2a01::1');
  });

  it('does not trim a numeric trailing group of an unbracketed IPv6 as a port', () => {
    // A port is impossible on an unbracketed IPv6 (that is what brackets are
    // for), so a trailing ":8080" is a hextet, kept — not a ':port' to trim.
    expect(extract('2a01::1:8080')).to.equal('2a01::1:8080');
    expect(extract('http://2a01::1:8080')).to.equal('2a01::1:8080');
    expect(extract('2a01::1:')).to.equal('2a01::1:');
  });

  it('resets the first-colon marker at each "@" (userinfo before IPv6)', () => {
    // The host's first ':' is tracked from after the last '@', so colons in
    // userinfo never make a real host:port look like an IPv6 (and vice versa).
    expect(extract('a@b@2a01::1')).to.equal('2a01::1');
    expect(extract('user:pass@example.com:8080')).to.equal('example.com');
  });

  it('treats a colon after a path delimiter as not-a-scheme', () => {
    // The scheme scan stops at the first '/', so there is no scheme here.
    expect(extract('example.com/a:b')).to.equal('example.com');
  });

  it('treats "token:token@host" as userinfo, not a scheme', () => {
    expect(extract('foo:bar@example.com')).to.equal('example.com');
  });

  it('keeps a bare host:port when the port is numeric', () => {
    expect(extract('localhost:8080/x')).to.equal('localhost');
    expect(extract('example.com:80')).to.equal('example.com');
  });

  it('does not treat an empty ":<delimiter>" as a port', () => {
    // Nothing between ':' and the end => not a port => opaque scheme => null.
    expect(extract('foo:')).to.equal(null);
  });

  it('parses an unknown (non-special) scheme authority only with "//"', () => {
    expect(extract('foo://bar.com/x')).to.equal('bar.com'); // "//" => authority
    expect(extract('foo:bar.com/x')).to.equal(null); // opaque path => no host
    expect(extract('foo:/path')).to.equal(null); // single slash, not an authority
  });

  it('classifies every special scheme written with "//" (fast path)', () => {
    expect(extract('http://example.com/')).to.equal('example.com');
    expect(extract('https://example.com/')).to.equal('example.com');
    expect(extract('ws://example.com/')).to.equal('example.com');
    expect(extract('wss://example.com/')).to.equal('example.com');
    expect(extract('ftp://example.com/')).to.equal('example.com');
  });

  it('returns null on an invalid scheme character', () => {
    expect(extract('ht~tp://example.com')).to.equal(null);
  });

  it('classifies every special scheme written without "//"', () => {
    expect(extract('ws:example.com')).to.equal('example.com'); // length 2
    expect(extract('wss:example.com')).to.equal('example.com'); // length 3
    expect(extract('ftp:example.com')).to.equal('example.com'); // length 3
    expect(extract('http:example.com')).to.equal('example.com'); // length 4
    expect(extract('https:example.com')).to.equal('example.com'); // length 5
  });

  it('does not classify look-alike schemes as special (each length)', () => {
    expect(extract('a:b.com')).to.equal(null); // length 1 (default arm)
    expect(extract('wx:b.com')).to.equal(null); // length 2, not ws
    expect(extract('abc:b.com')).to.equal(null); // length 3, not wss/ftp
    expect(extract('abcd:b.com')).to.equal(null); // length 4, not http/file
    expect(extract('abcde:b.com')).to.equal(null); // length 5, not https
    expect(extract('abcdef:b.com')).to.equal(null); // length >= 6 (default arm)
  });

  it('skips any run of "/" and "\\" after a special scheme', () => {
    expect(extract('https://example.com')).to.equal('example.com');
    expect(extract('https:\\\\example.com')).to.equal('example.com');
    expect(extract('https:///\\/example.com')).to.equal('example.com');
  });

  it('treats "\\" as a host terminator for special URLs only', () => {
    expect(extract('http://example.com\\path')).to.equal('example.com');
  });

  it('applies the file scheme authority rules', () => {
    expect(extract('file://host/x')).to.equal('host'); // "//" + host
    expect(extract('file:///x')).to.equal(null); // empty host
    expect(extract('file:/x')).to.equal(null); // fewer than two slashes (":/" path)
    expect(extract('file:x')).to.equal(null); // no slashes at all (cold path)
    expect(extract('file:\\\\host\\x')).to.equal('host'); // backslashes count as slashes
  });

  it('strips userinfo, including an empty one', () => {
    expect(extract('http://user:pass@example.com')).to.equal('example.com');
    expect(extract('http://@example.com')).to.equal('example.com');
  });

  it('strips the port', () => {
    expect(extract('http://example.com:8080/p')).to.equal('example.com');
  });

  it('strips trailing dots', () => {
    expect(extract('http://example.com.../x')).to.equal('example.com');
  });

  it('returns null for an empty authority', () => {
    expect(extract('http://')).to.equal(null);
    expect(extract('')).to.equal(null);
  });

  it('lower-cases a host that contains uppercase ASCII', () => {
    expect(extract('HTTP://EXAMPLE.COM')).to.equal('example.com');
  });

  it('returns an already-lowercase extracted host unchanged', () => {
    expect(extract('http://example.com/path')).to.equal('example.com');
  });
});

// The `validate` param (default false) is the performance fusion: when true,
// extractHostname accumulates is-valid.ts's RFC checks during its single
// authority scan and publishes the verdict via the module-scoped
// `extractedHostnameValidated`, so factory.ts can skip the redundant
// isValidHostname pass. The flag is `true` ONLY for a confirmed-valid "simple"
// authority (no userinfo / port / brackets / trailing dot / control char) where
// the scanned run equals the final host; every other case leaves it `false` so
// the caller re-validates. The extractor still returns the RAW host substring
// regardless of the flag — a `false` flag on an invalid host is the fail-safe
// (parseImpl then runs isValidHostname, which rejects it).
//
// These cases exercise the validate=true branches that the default-arg tests
// above never reach (the inline isValidHostnameChar / dot-length / first-char /
// last-label / total-length checks). Expected hosts were cross-checked against
// the v7.2.0 pre-fusion baseline (0 divergences); expected flag values were
// probed against the source.
describe('#extractHostname inline validation (validate=true)', () => {
  // extractHostname(url, false, true): exercise the fused validation path and
  // return [host, flag] so each case asserts both the substring AND the verdict.
  const extractV = (url: string): [string | null, boolean] => {
    const host = extractHostname(url, false, true);
    return [host, extractedHostnameValidated];
  };
  const rep = (s: string, n: number): string => {
    let r = '';
    for (let i = 0; i < n; i += 1) {
      r += s;
    }
    return r;
  };

  it('sets the flag for a simple valid authority (URL form)', () => {
    expect(extractV('http://example.com/p')).to.deep.equal([
      'example.com',
      true,
    ]);
    expect(extractV('http://sub.example.co.uk/p')).to.deep.equal([
      'sub.example.co.uk',
      true,
    ]);
  });

  it('sets the flag for a simple valid authority (bare host with path)', () => {
    expect(extractV('example.com/p')).to.deep.equal(['example.com', true]);
  });

  it('sets the flag once a host with uppercase is lowercased', () => {
    // hasUpper path + fusion: isValidHostnameChar accepts A-Z because the host
    // is lowercased before being returned/validated.
    expect(extractV('HTTP://EXAMPLE.COM/P')).to.deep.equal([
      'example.com',
      true,
    ]);
    expect(extractV('http://ExAmple.CoM/p')).to.deep.equal([
      'example.com',
      true,
    ]);
  });

  it('sets the flag for valid "loose" characters is-valid.ts accepts', () => {
    // Underscores (leading / mid / label-final), a leading dot, mid-label
    // hyphen, an all-digits label and non-ASCII are all valid per the shallow
    // validator, so the fused path validates them inline (flag true).
    expect(extractV('http://_example.com/p')).to.deep.equal([
      '_example.com',
      true,
    ]);
    expect(extractV('http://ex_ample.com/p')).to.deep.equal([
      'ex_ample.com',
      true,
    ]);
    expect(extractV('http://spf_.example.com/p')).to.deep.equal([
      'spf_.example.com',
      true,
    ]);
    expect(extractV('http://.example.com/p')).to.deep.equal([
      '.example.com',
      true,
    ]);
    expect(extractV('http://ex-ample.com/p')).to.deep.equal([
      'ex-ample.com',
      true,
    ]);
    expect(extractV('http://123.456/p')).to.deep.equal(['123.456', true]);
    expect(extractV('http://bücher.example/p')).to.deep.equal([
      'bücher.example',
      true,
    ]);
    expect(extractV('http://localhost/p')).to.deep.equal(['localhost', true]);
  });

  it('sets the flag at the length boundaries (label 63, total 255)', () => {
    // Last label exactly 63 (<= 63): valid, flag true.
    expect(extractV('http://ok.' + rep('a', 63))).to.deep.equal([
      'ok.' + rep('a', 63),
      true,
    ]);
    // First label exactly 63 (the in-loop `i - vLastDot > 64` dot check).
    expect(extractV('http://' + rep('a', 63) + '.com/p')).to.deep.equal([
      rep('a', 63) + '.com',
      true,
    ]);
    // Total length exactly 255 with a short last label — isolates the
    // `end - start <= 255` guard from the last-label guard. 'aaa.'*63 + 'aaa'.
    const h255 = rep('aaa.', 63) + 'aaa';
    expect(h255.length).to.equal(255);
    expect(extractV('http://' + h255 + '/p')).to.deep.equal([h255, true]);
  });

  it('clears the flag when a label exceeds 63 chars (still returns raw host)', () => {
    // 64-char label: the inline check sets vValid=false. The extractor still
    // RETURNS the (invalid) host — parseImpl re-runs isValidHostname → null.
    expect(extractV('http://ok.' + rep('a', 64))).to.deep.equal([
      'ok.' + rep('a', 64),
      false,
    ]);
    expect(extractV('http://' + rep('a', 64) + '.com/p')).to.deep.equal([
      rep('a', 64) + '.com',
      false,
    ]);
    // Single 64-char label, no dots (last-label guard with vLastDot = start-1).
    expect(extractV('http://' + rep('a', 64) + '/p')).to.deep.equal([
      rep('a', 64),
      false,
    ]);
  });

  it('clears the flag when the total length exceeds 255 chars', () => {
    // 256 total with a short last label — isolates the total-length guard.
    const h256 = rep('aaa.', 63) + 'aaaa';
    expect(h256.length).to.equal(256);
    expect(extractV('http://' + h256 + '/p')).to.deep.equal([h256, false]);
  });

  it('clears the flag on a leading hyphen (first-char rule)', () => {
    // First char '-' is rejected even though isValidHostnameChar allows '-'
    // mid-label; the explicit `c0 === 45` guard handles it.
    expect(extractV('http://-example.com/p')).to.deep.equal([
      '-example.com',
      false,
    ]);
  });

  it('clears the flag on a trailing hyphen (whole host and a label)', () => {
    // Whole-host trailing hyphen: vLastCode === 45 at the final guard.
    expect(extractV('http://example.com-/p')).to.deep.equal([
      'example.com-',
      false,
    ]);
    // A label ending in '-' before a dot: vLastCode === 45 at the dot.
    expect(extractV('http://foo-.bar.com/p')).to.deep.equal([
      'foo-.bar.com',
      false,
    ]);
  });

  it('clears the flag on consecutive dots (empty label)', () => {
    // vLastCode === 46 at the second dot.
    expect(extractV('http://a..b.com/p')).to.deep.equal(['a..b.com', false]);
  });

  it('clears the flag on a forbidden host character', () => {
    // '%' (< 64, not delimiter/dot/digit/'-') and ' ' (space) are invalid.
    expect(extractV('http://a%b.com/p')).to.deep.equal(['a%b.com', false]);
    expect(extractV('http://a b.com/p')).to.deep.equal(['a b.com', false]);
    // A forbidden char >= 64 (the `>= 64` invalid-char branch): '~'.
    expect(extractV('http://a~b.com/p')).to.deep.equal(['a~b.com', false]);
  });

  it('clears the flag for a complex authority even when the host is valid', () => {
    // userinfo / port / brackets / trailing dot make the scanned run differ
    // from the final host, so the verdict is suppressed (flag false) and the
    // caller falls back to isValidHostname. Host is still extracted correctly.
    expect(extractV('http://user@host.com/p')).to.deep.equal([
      'host.com',
      false,
    ]);
    expect(extractV('http://user:pass@host.com/p')).to.deep.equal([
      'host.com',
      false,
    ]);
    expect(extractV('http://host.com:8080/p')).to.deep.equal([
      'host.com',
      false,
    ]);
    expect(extractV('http://[::1]/p')).to.deep.equal(['::1', false]);
    expect(extractV('http://host.com./p')).to.deep.equal(['host.com', false]);
  });

  it('clears the flag for an empty / no-host result', () => {
    // No main return path ran (returned null before the verdict block).
    expect(extractV('http://')).to.deep.equal([null, false]);
    expect(extractV('data:text/plain,x')).to.deep.equal([null, false]);
    expect(extractV('mailto:x')).to.deep.equal([null, false]);
  });

  it('resets the flag to false when validate is not requested', () => {
    // Default-arg call (validate=false): the flag must be cleared at entry so a
    // stale `true` from a prior validate=true call never leaks to the caller.
    extractHostname('http://example.com/p', false, true);
    expect(extractedHostnameValidated).to.equal(true);
    const host = extractHostname('http://example.com/p', false);
    expect([host, extractedHostnameValidated]).to.deep.equal([
      'example.com',
      false,
    ]);
  });

  it('clears the flag on the urlIsValidHostname reference-equality path', () => {
    // When the input is already a valid hostname, extraction is skipped and the
    // same reference is returned; the flag stays false (factory.ts uses its own
    // reference-equality skip instead).
    const input = 'example.com';
    const host = extractHostname(input, true, true);
    expect(host).to.equal(input);
    expect(extractedHostnameValidated).to.equal(false);
  });

  it('re-validates after stripping an embedded tab/newline', () => {
    // The control-char branch recurses with `validate` preserved, so a host
    // that is valid after stripping still gets the flag.
    expect(extractV('http://exa\tmple.com/p')).to.deep.equal([
      'example.com',
      true,
    ]);
    // ...and an invalid host after stripping still clears it.
    expect(extractV('http://-exa\tmple.com/p')).to.deep.equal([
      '-example.com',
      false,
    ]);
  });
});
