import { expect } from 'chai';
import 'mocha';
import { existsSync } from 'fs';
import { resolve } from 'path';

import findBaseDir from '../src/find-base-dir';

describe('#findBaseDir', () => {
  // Success path: walk up from the module's directory to the nearest ancestor
  // that contains `target` and return its absolute path. Unchanged by the fix.
  it('resolves a target that exists in an ancestor directory', () => {
    const result = findBaseDir('package.json');
    expect(existsSync(result)).to.equal(true);
    // The nearest ancestor with a package.json is this package's own root.
    expect(result).to.equal(resolve(__dirname, '..', 'package.json'));
  });

  // Regression guard for the infinite loop: Node's `path.resolve('/', '../')`
  // returns '/' (the root is its own parent), so a target that exists in no
  // ancestor used to loop forever. It must now throw instead of hanging — this
  // test would hang before the fix. Ref: https://nodejs.org/api/path.html#pathresolvepaths
  it('throws (does not hang) when the target exists in no ancestor', () => {
    expect(() => findBaseDir('tldts-no-such-file-1f3c9a2b-4d5e.nope')).to.throw(
      /not found in any ancestor/,
    );
  });
});
