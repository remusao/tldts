import { expect } from 'chai';
import 'mocha';

import { FLAG, getEmptyResult, parseImpl } from '../src/factory';
import { IOptions } from '../src/options';

/**
 * Parse `url` with a stub lookup which finds no public suffix.
 */
function parse(url: string, options?: Partial<IOptions>) {
  return parseImpl(url, FLAG.ALL, () => false, options, getEmptyResult());
}

describe('#parseImpl', () => {
  it('stops at an IP address', () => {
    expect(parse('http://127.1/')).to.deep.equal({
      ...getEmptyResult(),
      hostname: '127.1',
      isIp: true,
    });
  });

  it('has no hostname for a host ending in a number which is no IPv4', () => {
    expect(parse('http://1.2.3.4.5/')).to.deep.equal({
      ...getEmptyResult(),
      isIp: false,
    });
    // Unless it is not validated.
    for (const options of [
      { validateHostname: false },
      { extractHostname: false },
    ]) {
      expect(parse('1.2.3.4.5', options).hostname).to.equal('1.2.3.4.5');
    }
  });
});
