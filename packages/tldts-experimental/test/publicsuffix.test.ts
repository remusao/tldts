// @ts-ignore
import * as tldMinified from '../dist/index.umd.min';
import * as tld from '../index';

import { publicSuffixListTests } from 'tldts-tests';

describe('tldts classic', () => {
  publicSuffixListTests(tld.getDomain);
});

describe('tldts minified', () => {
  publicSuffixListTests(tldMinified.getDomain);
});
