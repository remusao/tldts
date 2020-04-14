import 'mocha'

import { tldtsTests } from 'tldts-tests';

import * as tld from '../index';

describe('tldts classic', () => {
  tldtsTests(tld);
});
