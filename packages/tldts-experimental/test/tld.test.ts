import 'mocha';

import { tldtsTests } from 'tldts-tests';

import * as tld from '../index';

describe('tldts experimental', () => {
  tldtsTests(tld);
});
