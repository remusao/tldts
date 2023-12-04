import 'mocha';

import * as tld from '../index';

import { publicSuffixListTests } from 'tldts-tests';

describe('tldts classic', () => {
  publicSuffixListTests(tld.getDomain, { includePrivate: true });
});
