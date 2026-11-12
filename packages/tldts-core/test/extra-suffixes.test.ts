import { expect } from 'chai';
import 'mocha';

import { FLAG, getEmptyResult, parseImpl } from '../src/factory';
import { IOptions } from '../src/options';

/**
 * Parse `host` with a stub built-in lookup returning `suffix`, its flags and
 * whether it matched an exception rule, plus `options` (e.g. extraSuffixes).
 */
function parse(
  host: string,
  [suffix, isIcann, isPrivate, isException = false]: [
    string | null,
    boolean,
    boolean,
    boolean?,
  ],
  options?: Partial<IOptions>,
) {
  return parseImpl(
    host,
    FLAG.ALL,
    (_hostname, _options, out) => {
      out.publicSuffix = suffix;
      out.isIcann = isIcann;
      out.isPrivate = isPrivate;
      return isException;
    },
    options,
    getEmptyResult(),
  );
}

const ICANN = { isIcann: true, isPrivate: false };
const PRIVATE = { isIcann: false, isPrivate: true };

describe('extraSuffixes', () => {
  it('leaves the built-in result alone when unset or unmatched', () => {
    for (const options of [undefined, { extraSuffixes: undefined }]) {
      expect(parse('x.com', ['com', true, false], options)).to.include({
        publicSuffix: 'com',
        ...ICANN,
      });
    }
    // Misaligned label, longer than the host, case-sensitive, and junk rules.
    const icann = ['us.com', '*.us.com', '!x.notus.com', 'NOTUS.COM'];
    icann.push('', '*.', '!', '!zz');
    expect(
      parse('notus.com', ['com', true, false], { extraSuffixes: { icann } }),
    ).to.include({ publicSuffix: 'com', ...ICANN });
    // Empty rules would match a trailing dot; a dot-less exception, the host.
    expect(
      parse('x.com.', ['', false, false], {
        extractHostname: false,
        extraSuffixes: { icann: ['', '*.', '!'] },
      }),
    ).to.include({ publicSuffix: '', isIcann: false });
    expect(
      parse('a.b.zz', ['zz', false, false], {
        extraSuffixes: { icann: ['!zz'] },
      }),
    ).to.include({ publicSuffix: 'zz', isIcann: false });
  });

  it('treats a lookup reporting nothing as not an exception', () => {
    // E.g. an older build bundled with a newer tldts-core.
    const result = parseImpl(
      'x.us.com',
      FLAG.ALL,
      (_hostname, _options, out) => {
        out.publicSuffix = 'com';
      },
      { extraSuffixes: { icann: ['us.com'] } },
      getEmptyResult(),
    );
    expect(result).to.include({ publicSuffix: 'us.com', ...ICANN });
  });

  it('skips non-string rules and non-array lists', () => {
    // A sparse array yields `undefined` for its holes.
    const icann = new Array<string>(3);
    icann[1] = null as unknown as string;
    icann[2] = 'us.com';
    expect(
      parse('x.us.com', ['com', true, false], { extraSuffixes: { icann } }),
    ).to.include({ publicSuffix: 'us.com', ...ICANN });
    const bad = { icann: {}, private: 5 } as unknown as { icann: string[] };
    expect(
      parse('x.us.com', ['com', true, false], {
        allowPrivateDomains: true,
        extraSuffixes: bad,
      }),
    ).to.include({ publicSuffix: 'com', ...ICANN });
  });

  it('keeps a null built-in suffix', () => {
    expect(
      parse('x.com', [null, false, false], {
        extraSuffixes: { icann: ['x.com'] },
      }),
    ).to.include({ publicSuffix: null });
  });

  it('prefers the longest extra rule, whatever its position', () => {
    const result = parse('x.a.b.p', ['p', true, false], {
      extraSuffixes: { icann: ['a.b.p', '*.p', 'b.p'] },
    });
    expect(result).to.include({
      publicSuffix: 'a.b.p',
      domain: 'x.a.b.p',
      ...ICANN,
    });
  });

  it('matches one label under a wildcard, and implies its parent', () => {
    expect(
      parse('a.x.p', ['p', false, false], {
        allowPrivateDomains: true,
        extraSuffixes: { private: ['*.p'] },
      }),
    ).to.include({ publicSuffix: 'x.p', ...PRIVATE });
    expect(
      parse('foo.com', ['com', true, false], {
        extraSuffixes: { icann: ['*.foo.com'] },
      }),
    ).to.include({ publicSuffix: 'foo.com', domain: null, ...ICANN });
    // The label under the wildcard may be empty, as in the built-in lookup.
    expect(
      parse('.foo.zz', ['zz', false, false], {
        extractHostname: false,
        extraSuffixes: { icann: ['*.foo.zz'] },
      }),
    ).to.include({ publicSuffix: '.foo.zz', ...ICANN });
  });

  it('keeps the built-in flags on a tie, unless it matched no rule', () => {
    expect(
      parse('x.co.p', ['co.p', true, false], {
        allowPrivateDomains: true,
        extraSuffixes: { private: ['co.p'] },
      }),
    ).to.include({ publicSuffix: 'co.p', ...ICANN });
    expect(
      parse('x.p', ['p', false, false], { extraSuffixes: { icann: ['p'] } }),
    ).to.include({ publicSuffix: 'p', ...ICANN });
    // Between extra rules or exceptions, `icann` wins.
    for (const rule of ['p', '!x.p']) {
      expect(
        parse('x.p', ['p', false, false], {
          allowPrivateDomains: true,
          extraSuffixes: { icann: [rule], private: [rule] },
        }),
      ).to.include({ publicSuffix: 'p', ...ICANN });
    }
  });

  it('applies an extra exception unless a longer rule matches', () => {
    // Ties with the built-in rule, or with an extra rule: the exception wins.
    expect(
      parse('y.x.a.p', ['x.a.p', true, false], {
        extraSuffixes: { icann: ['!x.a.p', '!a.p'] },
      }),
    ).to.include({ publicSuffix: 'a.p', domain: 'x.a.p', ...ICANN });
    expect(
      parse('x.a.p', ['p', false, false], {
        extraSuffixes: { icann: ['x.a.p', '!x.a.p'] },
      }),
    ).to.include({ publicSuffix: 'a.p', ...ICANN });
    // A longer built-in or extra rule wins.
    expect(
      parse('q.x.a.p', ['x.a.p', true, false], {
        allowPrivateDomains: true,
        extraSuffixes: { private: ['!a.p'] },
      }),
    ).to.include({ publicSuffix: 'x.a.p', domain: 'q.x.a.p', ...ICANN });
    expect(
      parse('q.x.a.p', ['p', false, false], {
        extraSuffixes: { icann: ['q.x.a.p', '!x.a.p'] },
      }),
    ).to.include({ publicSuffix: 'q.x.a.p', domain: null, ...ICANN });
  });

  it('applies the longest exception, built-in or extra', () => {
    // Longer extra exception wins.
    expect(
      parse('x.a.b.p', ['b.p', true, false, true], {
        allowPrivateDomains: true,
        extraSuffixes: { private: ['!x.a.b.p'] },
      }),
    ).to.include({ publicSuffix: 'a.b.p', domain: 'x.a.b.p', ...PRIVATE });
    // Same exception: the built-in one is kept.
    expect(
      parse('x.a.p', ['p', true, false, true], {
        extraSuffixes: { private: ['!a.p'] },
        allowPrivateDomains: true,
      }),
    ).to.include({ publicSuffix: 'p', ...ICANN });
  });

  it('lets only a longer extra rule beat a built-in exception', () => {
    // Built-in `!a.p`: an extra rule as long ties, and the exception wins.
    expect(
      parse('x.a.p', ['p', true, false, true], {
        allowPrivateDomains: true,
        extraSuffixes: { private: ['a.p', '*.p'] },
      }),
    ).to.include({ publicSuffix: 'p', ...ICANN });
    expect(
      parse('x.a.p', ['p', true, false, true], {
        allowPrivateDomains: true,
        extraSuffixes: { private: ['x.a.p'] },
      }),
    ).to.include({ publicSuffix: 'x.a.p', domain: null, ...PRIVATE });
  });

  it('gates each section like the built-in rules', () => {
    expect(
      parse('x.us.com', ['com', true, false], {
        extraSuffixes: { private: ['us.com'] },
      }),
    ).to.include({ publicSuffix: 'com', ...ICANN });
    expect(
      parse('x.us.com', ['com', false, false], {
        allowIcannDomains: false,
        extraSuffixes: { icann: ['us.com'] },
      }),
    ).to.include({ publicSuffix: 'com', isIcann: false });
  });
});
