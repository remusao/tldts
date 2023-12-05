import 'mocha';

import * as tld from '../index';

import { tldtsTests } from 'tldts-tests';

describe('tldts classic (ICANN only)', () => {
  tldtsTests(tld, { includePrivate: false });
});
