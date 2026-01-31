import { expect } from 'chai';
import 'mocha';

import { parsePublicSuffixRules } from '..';
import type { IRule } from '..';

describe('#parsePublicSuffixRules', () => {
  it('parses rules correctly', () => {
    const rules: IRule[] = [];
    parsePublicSuffixRules(
      `
// Comment
com
*.com
!www.com
`,
      (rule) => {
        rules.push(rule);
      },
    );
    expect(rules).to.eql([
      {
        isException: false,
        isIcann: true,
        isNormal: true,
        isWildcard: false,
        rule: 'com',
      },
      {
        isException: false,
        isIcann: true,
        isNormal: false,
        isWildcard: true,
        rule: '*.com',
      },
      {
        isException: true,
        isIcann: true,
        isNormal: false,
        isWildcard: false,
        rule: 'www.com',
      },
    ]);
  });

  it('handles private section, whitespace and punycode', () => {
    const rules: IRule[] = [];
    parsePublicSuffixRules(
      `
// comment
COM
example.test extra
// ===BEGIN PRIVATE DOMAINS===
*.Priv.Example
!EXCEPTION.PRIV.EXAMPLE
éxample
`,
      (rule) => rules.push(rule),
    );

    expect(rules.some((rule) => rule.rule === 'com')).to.equal(true);
    expect(rules.some((rule) => rule.rule === 'example.test')).to.equal(true);
    expect(
      rules.some((rule) => rule.rule === '*.priv.example' && !rule.isIcann),
    ).to.equal(true);
    expect(
      rules.some(
        (rule) =>
          rule.rule === 'exception.priv.example' &&
          rule.isException &&
          !rule.isIcann,
      ),
    ).to.equal(true);
    expect(rules.some((rule) => rule.rule === 'xn--xample-9ua')).to.equal(true);
  });
});
