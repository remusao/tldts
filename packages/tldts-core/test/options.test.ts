import { expect } from 'chai';
import 'mocha';

import { setDefaults } from '../src/options';

describe('#setDefaults', () => {
  it('takes `null` for no options', () => {
    expect(setDefaults(null)).to.equal(setDefaults());
  });
});
