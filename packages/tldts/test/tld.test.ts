// @ts-ignore
import * as tldMinified from '../dist/index.umd.min';
import * as tld from '../index';

import { tldtsTests } from 'tldts-tests';

describe('tldts classic', () => {
  tldtsTests(tld);
});

describe('tldts minified', () => {
  tldtsTests(tldMinified);
});
