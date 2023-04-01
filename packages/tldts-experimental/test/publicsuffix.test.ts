import 'mocha';

import { publicSuffixListTests } from 'tldts-tests';

import * as tld from '../index';

describe('tldts experimental', () => {
  publicSuffixListTests(tld.getDomain);
});
