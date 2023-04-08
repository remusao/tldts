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
});
