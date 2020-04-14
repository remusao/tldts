import 'mocha';

import * as tld from '../index';

import { tldtsTests } from 'tldts-tests';

describe('tldts classic', () => {
  tldtsTests(tld);
});
