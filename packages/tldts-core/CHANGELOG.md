# v6.0.6 (Fri Jun 16 2023)

#### :nut_and_bolt: Dependencies

- Bump rimraf from 4.4.1 to 5.0.1 [#1654](https://github.com/remusao/tldts/pull/1654) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- Bump @types/node from 18.16.3 to 20.2.3 [#1658](https://github.com/remusao/tldts/pull/1658) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 1

- [@dependabot[bot]](https://github.com/dependabot[bot])

---

# v6.0.3 (Sat Apr 08 2023)

#### :scroll: Update Public Suffix List

- Update upstream public suffix list [#1598](https://github.com/remusao/tldts/pull/1598) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v6.0.0 (Sat Apr 01 2023)

### Release Notes

#### Be more lenient in accepting leading underscores and dots in hostnames ([#1553](https://github.com/remusao/tldts/pull/1553))

Handling of _leading dot(s)_ in input URIs and hostnames:

```patch
- expect(isValidHostname('.github.com')).to.equal(false);
+ expect(isValidHostname('.github.com')).to.equal(true);

- expect(getDomain('.github.com')).to.equal(null);
+ expect(getDomain('.github.com')).to.equal('github.com');

- expect(getDomain('.remusao.github.io')).to.equal(null);
+ expect(getDomain('.remusao.github.io')).to.equal('github.io');
```

Handling of _leading underscores_ in input URIs and hostnames:

```patch
- expect(getDomain('_0f6879.bsg-1418.bryanjswift.com')).to.equal(null);
+ expect(getDomain('_0f6879.bsg-1418.bryanjswift.com')).to.equal('bryanjswift.com');
```

Lastly, increase test coverage using test cases found in the [whatwg](https://url.spec.whatwg.org/#host-miscellaneous) spec.

This is a breaking change because some might rely on the previous behavior to consider leading dots and underscores as invalid hostnames or domains.

Resolves #1534
Resolves #1523

#### tooling: migrate to eslint + TypeScript v5 + prettier ([#1575](https://github.com/remusao/tldts/pull/1575))

Updated internal representation of the DAWG used to encode the public suffix list, resulting in ~5% size reduction of minified bundle for identical performance (and likely a faster parsing/loading time of the source, although I did not measure that particular aspect yet).

Migrate from deprecated `tslint` to eslint with TypeScript support and fix most of the issues encountered, resulting in tighter typing. Bump TypeScript to v5 as well and make sure code-base is formatted according to prettier's preset.

---

#### :boom: Breaking Change

- Be more lenient in accepting leading underscores and dots in hostnames [#1553](https://github.com/remusao/tldts/pull/1553) ([@remusao](https://github.com/remusao))

#### :house: Internal

- tooling: migrate to eslint + TypeScript v5 + prettier [#1575](https://github.com/remusao/tldts/pull/1575) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.7.110 (Wed Mar 01 2023)

#### :house: Internal

- Update deprecated dep and refresh lock [#1554](https://github.com/remusao/tldts/pull/1554) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.7.105 (Thu Feb 02 2023)

#### :nut_and_bolt: Dependencies

- Bump rimraf from 3.0.2 to 4.1.2 [#1525](https://github.com/remusao/tldts/pull/1525) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- Bump @rollup/plugin-typescript from 10.0.1 to 11.0.0 [#1515](https://github.com/remusao/tldts/pull/1515) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 1

- [@dependabot[bot]](https://github.com/dependabot[bot])

---

# v5.7.102 (Thu Dec 01 2022)

#### :nut_and_bolt: Dependencies

- Bump @rollup/plugin-typescript from 9.0.2 to 10.0.0 [#1484](https://github.com/remusao/tldts/pull/1484) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 1

- [@dependabot[bot]](https://github.com/dependabot[bot])

---

# v5.7.98 (Sat Nov 05 2022)

#### :house: Internal

- Dependencies updates [#1464](https://github.com/remusao/tldts/pull/1464) ([@remusao](https://github.com/remusao))

#### :nut_and_bolt: Dependencies

- Bump @types/mocha from 9.1.1 to 10.0.0 [#1443](https://github.com/remusao/tldts/pull/1443) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 2

- [@dependabot[bot]](https://github.com/dependabot[bot])
- Rémi ([@remusao](https://github.com/remusao))

---

# v5.7.92 (Sat Sep 24 2022)

#### :nut_and_bolt: Dependencies

- Bump @rollup/plugin-node-resolve from 13.3.0 to 14.1.0 [#1431](https://github.com/remusao/tldts/pull/1431) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 1

- [@dependabot[bot]](https://github.com/dependabot[bot])

---

# v5.7.87 (Tue Aug 02 2022)

#### :nail_care: Polish

- Add index.ts as part of published packages [#1398](https://github.com/remusao/tldts/pull/1398) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.7.85 (Sun Jul 31 2022)

#### :nail_care: Polish

- Include 'src' folder as part of published packages [#1396](https://github.com/remusao/tldts/pull/1396) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.7.83 (Wed Jun 29 2022)

#### :nut_and_bolt: Dependencies

- Bump mocha from 9.2.2 to 10.0.0 [#1327](https://github.com/remusao/tldts/pull/1327) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- Bump @types/node from 17.0.41 to 18.0.0 [#1364](https://github.com/remusao/tldts/pull/1364) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 1

- [@dependabot[bot]](https://github.com/dependabot[bot])

---

# v5.7.59 (Fri Jan 21 2022)

#### :nut_and_bolt: Dependencies

- Bump @types/node from 16.11.11 to 17.0.8 [#1244](https://github.com/remusao/tldts/pull/1244) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 1

- [@dependabot[bot]](https://github.com/dependabot[bot])

---

# v5.7.39 (Thu Aug 05 2021)

#### :nut_and_bolt: Dependencies

- Bump @types/mocha from 8.2.3 to 9.0.0 [#1125](https://github.com/remusao/tldts/pull/1125) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- Bump @types/node from 15.12.4 to 16.3.2 [#1118](https://github.com/remusao/tldts/pull/1118) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- Bump mocha from 8.4.0 to 9.0.0 [#1088](https://github.com/remusao/tldts/pull/1088) ([@dependabot[bot]](https://github.com/dependabot[bot]))

#### Authors: 1

- [@dependabot[bot]](https://github.com/dependabot[bot])

---

# v5.7.38 (Sun May 30 2021)

#### :scroll: Update Public Suffix List

- Bump deps + GitHub actions + update rules [#1079](https://github.com/remusao/tldts/pull/1079) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.7.35 (Tue May 11 2021)

#### :house: Internal

- Refresh yarn.lock + updates [#1059](https://github.com/remusao/tldts/pull/1059) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.7.32 (Wed Apr 28 2021)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump @types/node from 14.14.41 to 15.0.1 [#1044](https://github.com/remusao/tldts/pull/1044) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.7.0 (Fri Jan 22 2021)

#### :rocket: New Feature

- Migrate to using Terser [#893](https://github.com/remusao/tldts/pull/893) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.6.74 (Wed Dec 02 2020)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump @rollup/plugin-node-resolve from 10.0.0 to 11.0.0 [#838](https://github.com/remusao/tldts/pull/838) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.62 (Thu Oct 29 2020)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump @rollup/plugin-node-resolve from 9.0.0 to 10.0.0 [#797](https://github.com/remusao/tldts/pull/797) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.51 (Tue Aug 25 2020)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump typescript from 3.9.7 to 4.0.2 [#729](https://github.com/remusao/tldts/pull/729) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.49 (Fri Aug 14 2020)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump @rollup/plugin-node-resolve from 8.4.0 to 9.0.0 [#714](https://github.com/remusao/tldts/pull/714) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.39 (Tue Jul 14 2020)

#### :nut_and_bolt: Dependencies

- chore(deps): bump @types/mocha from 7.0.2 to 8.0.0 [#667](https://github.com/remusao/tldts/pull/667) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.31 (Thu Jun 11 2020)

#### :nut_and_bolt: Dependencies

- chore(deps): bump mocha from 7.2.0 to 8.0.1 [#634](https://github.com/remusao/tldts/pull/634) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.26 (Sat May 23 2020)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump @rollup/plugin-node-resolve from 7.1.3 to 8.0.0 [#588](https://github.com/remusao/tldts/pull/588) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))
- chore(deps-dev): bump @types/node from 13.13.5 to 14.0.0 [#571](https://github.com/remusao/tldts/pull/571) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.25 (Wed May 06 2020)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump rollup-plugin-sourcemaps from 0.5.0 to 0.6.1 [#555](https://github.com/remusao/tldts/pull/555) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.24 (Fri Apr 24 2020)

#### :house: Internal

- Migrate from jest to mocha + chai [#525](https://github.com/remusao/tldts/pull/525) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.6.21 (Mon Apr 06 2020)

#### :bug: Bug Fix

- Fix handling of data URLs [#502](https://github.com/remusao/tldts/pull/502) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.6.11 (Wed Mar 11 2020)

#### :nut_and_bolt: Dependencies

- chore(deps-dev): bump rollup from 1.32.1 to 2.0.0 [#421](https://github.com/remusao/tldts/pull/421) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 1

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])

---

# v5.6.8 (Wed Feb 19 2020)

#### :scroll: Update Public Suffix List

- Fix CHANGELOG titles [skip ci] ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v5.6.4 (Sun Feb 16 2020)

#### :scroll: Update Public Suffix List

- Release v5.6.3 ([@remusao](https://github.com/remusao))
- Release v5.6.2 ([@remusao](https://github.com/remusao))
- Release v5.6.1 ([@remusao](https://github.com/remusao))
- fix: handling of ipv6 when 'extractHostname' option is 'false' ([@remusao](https://github.com/remusao))
- chore(deps-dev): bump @types/node from 12.12.21 to 13.1.0

Bumps [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/node) from 12.12.21 to 13.1.0.

- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)
- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/node)

Signed-off-by: dependabot-preview[bot] <support@dependabot.com> ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

- chore(deps-dev): bump rollup-plugin-sourcemaps from 0.4.2 to 0.5.0

Bumps [rollup-plugin-sourcemaps](https://github.com/maxdavidson/rollup-plugin-sourcemaps) from 0.4.2 to 0.5.0.

- [Release notes](https://github.com/maxdavidson/rollup-plugin-sourcemaps/releases)
- [Changelog](https://github.com/maxdavidson/rollup-plugin-sourcemaps/blob/master/CHANGELOG.md)
- [Commits](https://github.com/maxdavidson/rollup-plugin-sourcemaps/compare/v0.4.2...v0.5.0)

Signed-off-by: dependabot-preview[bot] <support@dependabot.com> ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### :nut_and_bolt: Dependencies

- chore(deps): bump @types/jest from 24.9.1 to 25.1.0

Bumps [@types/jest](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/jest) from 24.9.1 to 25.1.0.

- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)
- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/jest)

Signed-off-by: dependabot-preview[bot] <support@dependabot.com> [#361](https://github.com/remusao/tldts/pull/361) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

- chore(deps): bump ts-jest from 24.3.0 to 25.0.0

Bumps [ts-jest](https://github.com/kulshekhar/ts-jest) from 24.3.0 to 25.0.0.

- [Release notes](https://github.com/kulshekhar/ts-jest/releases)
- [Changelog](https://github.com/kulshekhar/ts-jest/blob/master/CHANGELOG.md)
- [Commits](https://github.com/kulshekhar/ts-jest/compare/v24.3.0...v25.0.0)

Signed-off-by: dependabot-preview[bot] <support@dependabot.com> [#358](https://github.com/remusao/tldts/pull/358) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

- chore(deps): bump jest from 24.9.0 to 25.1.0

Bumps [jest](https://github.com/facebook/jest) from 24.9.0 to 25.1.0.

- [Release notes](https://github.com/facebook/jest/releases)
- [Changelog](https://github.com/facebook/jest/blob/master/CHANGELOG.md)
- [Commits](https://github.com/facebook/jest/compare/v24.9.0...v25.1.0)

Signed-off-by: dependabot-preview[bot] <support@dependabot.com> [#353](https://github.com/remusao/tldts/pull/353) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

- chore(deps-dev): bump tslint from 5.20.1 to 6.0.0

Bumps [tslint](https://github.com/palantir/tslint) from 5.20.1 to 6.0.0.

- [Release notes](https://github.com/palantir/tslint/releases)
- [Changelog](https://github.com/palantir/tslint/blob/master/CHANGELOG.md)
- [Commits](https://github.com/palantir/tslint/compare/5.20.1...6.0.0)

Signed-off-by: dependabot-preview[bot] <support@dependabot.com> [#355](https://github.com/remusao/tldts/pull/355) ([@dependabot-preview[bot]](https://github.com/dependabot-preview[bot]))

#### Authors: 2

- [@dependabot-preview[bot]](https://github.com/dependabot-preview[bot])
- Rémi ([@remusao](https://github.com/remusao))
