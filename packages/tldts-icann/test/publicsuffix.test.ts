import 'mocha';

import * as tld from '../index';

import { publicSuffixListTests } from 'tldts-tests';

describe('tldts classic (ICANN only)', () => {
  publicSuffixListTests(tld.getDomain, { includePrivate: false });
});
