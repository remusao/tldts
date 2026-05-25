# v7.3.0 (Mon May 25 2026)

#### :running_woman: Performance

- perf(core): validate hostname inline during extraction to drop a redundant scan [#2590](https://github.com/remusao/tldts/pull/2590) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.2.1 (Mon May 25 2026)

#### :nail_care: Polish

- fix: extract unbracketed IPv6 hostnames instead of mangling them [#2589](https://github.com/remusao/tldts/pull/2589) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.2.0 (Mon May 25 2026)

#### :rocket: New Feature

- feat: add opt-in IANA special-use domain detection [#2588](https://github.com/remusao/tldts/pull/2588) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.1.1 (Sun May 24 2026)

#### :nail_care: Polish

- fix: make hostname extraction match WHATWG URL host boundaries [#2586](https://github.com/remusao/tldts/pull/2586) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.1.0 (Sat May 23 2026)

#### :running_woman: Performance

- Better performance and reduce memory allocations [#2585](https://github.com/remusao/tldts/pull/2585) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.0.32 (Sat May 23 2026)

#### :bug: Bug Fix

- fix: accept labels ending with an underscore [#2583](https://github.com/remusao/tldts/pull/2583) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.0.22 (Tue Feb 03 2026)

#### :nut_and_bolt: Dependencies

- Bump chai from 4.5.0 to 6.2.2 [#2482](https://github.com/remusao/tldts/pull/2482) ([@dependabot[bot]](https://github.com/dependabot[bot]))
- chore: upgrade dependencies [#2498](https://github.com/remusao/tldts/pull/2498) ([@remusao](https://github.com/remusao))

#### Authors: 2

- [@dependabot[bot]](https://github.com/dependabot[bot])
- Rémi ([@remusao](https://github.com/remusao))

---

# v7.0.21 (Sun Feb 01 2026)

#### :scroll: Update Public Suffix List

- Update PSL + dependencies [#2497](https://github.com/remusao/tldts/pull/2497) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.0.20 (Sat Jan 31 2026)

#### ⚠️ Pushed to `master`

- Bump to Yarn 4 and try to fix publishing. ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.0.18 (Mon Nov 17 2025)

#### :scroll: Update Public Suffix List

- Update upstream public suffix list [#2452](https://github.com/remusao/tldts/pull/2452) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v7.0.0 (Sat Apr 12 2025)

#### :boom: Breaking Change

- Fix inconsistent hostname validation in `getHostname` and `parse(url).hostname` when `validateHostname` is enabled [#2262](https://github.com/remusao/tldts/pull/2262) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))

---

# v6.1.81 (Sat Mar 01 2025)

#### :scroll: Update Public Suffix List

- Fix scope [#2291](https://github.com/remusao/tldts/pull/2291) ([@remusao](https://github.com/remusao))
- Fix bundle [#2290](https://github.com/remusao/tldts/pull/2290) ([@remusao](https://github.com/remusao))
- Make sure internal packages are also present on npmjs [#2289](https://github.com/remusao/tldts/pull/2289) ([@remusao](https://github.com/remusao))

#### Authors: 1

- Rémi ([@remusao](https://github.com/remusao))
