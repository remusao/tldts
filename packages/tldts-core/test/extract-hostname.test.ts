import { expect } from 'chai';
import 'mocha';

import extractHostname from '../src/extract-hostname';

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
