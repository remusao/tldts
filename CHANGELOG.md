## Change Log

### Not Released

### 5.1.0

*2019-06-06*

- [#164](https://github.com/remusao/tldts/pull/164) Update rules + add fast path for experimental bundle as well

### 5.0.3

*2019-05-29*

- [#155](https://github.com/remusao/tldts/pull/151) Update Public Suffix Lists to [f651d07](https://github.com/publicsuffix/list/commit/f651d07f85b5e25f8bc757f0e7db60ec5c41c256)

### 5.0.2

*2019-05-24*

- [#151](https://github.com/remusao/tldts/pull/151) Update Public Suffix Lists to [456d938](https://github.com/publicsuffix/list/commit/456d93876bf5435424646114ad577c3e2aee7587)

### 5.0.1

*2019-05-23*

- [#150](https://github.com/remusao/tldts/pull/150) Update Public Suffix Lists to [7697e3c](https://github.com/publicsuffix/list/commit/7697e3c95a8bb61831d5b4df1f9c942e2095faba)

### 5.0.0

*2019-05-23*

- Improvements in various areas [#149](https://github.com/remusao/tldts/pull/149)
  * Performance improvements in all methods of public API (up to x2 faster)
    * `extractHostname`: will now avoid lower-casing the result in some cases
    * `extractHostname`: handles single or triple '/' after protocol
    * `extractHostname`: has fast-path for validation of common protocols (e.g. https)
    * `isProbablyIpv4`: performs first quick check on length of hostname
    * `isProbablyIpv6`: performs first quick check on length of hostname
    * `isValidHostname`: make use of `charCodeAt` instead of `codePointAt`
    * `lookupInTrie`: makes use of Trie with more stable structure (faster)
    * `lookupInTrie`: lazily allocate memory for result
    * `suffixLookup`: uses fast-path for most common suffixes (massive speed-up)
    * `suffixLookup`: does not allocate memory for result anymore
    * `setDefaults`: fast-path in case no argument was provided
    * `getSubdomain`: fast-path if subdomain is empty
  * Add more options to fine-tune behavior and performance
    * `detectIp` allows to disable IP check
    * `mixedInput` allows to specify if we expect a mix of URLs and hostnames as
      input. If only hostnames are expected then `extractHostname` can be set to
      `false` to speed-up parsing. If only URLs are expected then `mixedInputs`
      can be set to `false`. The `mixedInputs` is only a hint and will not
      change the behavior of the library.
    * `validateHostname` can be set to `false` to disable validation and
      speed-up processing further.
  * Check that input is string before parsing
  * Fix support for reserved keywords in hostnames
  * Add tests and bring back coverage to 100%
  * Minified bundle is now also tested with the same suite
  * Migrate utils scripts from `bin/` folder to TypeScript
  * Add small `tldts` cli which can be used to parse URLs
  * Update README with more accurate information

### 4.0.6

*2019-04-15*

- [#123](https://github.com/remusao/tldts/pull/123) Update Public Suffix Lists to 033221af7f600bcfce38dcbfafe03b9a2269c4cc

### 4.0.5

*2019-03-29*

- [#101](https://github.com/remusao/tldts/pull/101) Update Public Suffix Lists
- [#101](https://github.com/remusao/tldts/pull/101) Update dev dependencies

### 4.0.4

*2019-03-28*

- [#100](https://github.com/remusao/tldts/pull/100) Update Public Suffix Lists

### 4.0.3

*2019-03-10*

- [#82](https://github.com/remusao/tldts/pull/82) Update Public Suffix Lists

### 4.0.2

*2019-02-05*

- [#36](https://github.com/remusao/tldts/pull/36) Update Public Suffix Lists

### 4.0.1

*2019-01-29*

- [#35](https://github.com/remusao/tldts/pull/35) Update Public Suffix Lists
  * https://github.com/publicsuffix/list/commit/5d3dfdf7f074ca2831d7c2413cf50b976a019a39

### 4.0.0

*2019-01-07*

This Release introduces some more optimizations both in size of bundles,
memory usage and speed of parsing. Because it introduces some breaking
changes in the API results (`host` renamed into `hostname` and deletion
of the `isValid` attribute), as well as introducing a new experimental
backend (`tldts-experimental` bundle), this is a major version bump.

- [#16](https://github.com/remusao/tldts/pull/16) Optimizations + comparison with other libraries (#16)
  * Optimize Trie into a DAWG (size reduction)
  * Implement comparison with other libraries
  * Implement fast path for valid hostnames as arguments
  * Allow to disable hostname parsing and validation using option
  * Add tests for corner-cases URLs parsing
  * Update README

- [#13](https://github.com/remusao/tldts/pull/13) Implement experimental probabilistic packed suffix structure (#13)
  * Implement packed hash probabilistic structure for more compact
    representation and faster lookups. See ./bin/builders/hashes.js for more
    details about how it works.
  * Create second bundle (tldts-experimental) making use of this new implementation
  * Simplify hostname validation and remove strict IDNA checks
  * Move lookup implementations into 'lookup' sub-folder
  * Move compiled data into 'lookup/data' sub-folder
  * Refactor suffix list parsing out of builders
  * Handle IDNA hostnames at build-time instead of runtime (by indexing
    some suffixes multiple times: once puny-coded and once in unicode form)

### 3.1.1

- Minify rules and idna files

### 3.1.0

- [#3](https://github.com/remusao/tldts/pull/3) Various optimizations
  * Rules are now shipped in a parsed form in the bundle
  * Rules cannot be updated (opinionated)
  * Trie matching is now iterative
  * All rules are stored in their ASCII form instead of Unicode
  * Use ts-jest to run tests
  * Remove dist folder from source tree
  * Hostname parsing has been optimized
- [#2](https://github.com/remusao/tldts/pull/2) Fix isPrivate being undefined
- [#4](https://github.com/remusao/tldts/pull/4) Optimize the implementation of options' setDefaults

### 3.0.2 (2018/10/03 15h46)

- [#6](https://github.com/remusao/tldts/pull/6) Update Public Suffix Lists
  * https://github.com/publicsuffix/list/commit/6f2b9e75eaf65bb75da83677655a59110088ebc5

### 3.0.1 (2018/10/02 22:43 +00:00)

- [#5](https://github.com/remusao/tldts/pull/5) Update Public Suffix Lists
  * https://github.com/publicsuffix/list/commit/1422e8a1dfa290b11a483ec660435e33841cf96a

### 3.0.0 (2018/09/18 11:42 +00:00)
- [#1](https://github.com/remusao/tld.js/pull/1) Tldts - typescript rewrite
  * Introduce two new options to enabled/disabled the Private/ICANN domains.
  * 'allowIcann' set to 'false' will ignore the ICANN section of the list.
  * 'allowPrivate' set to 'false' will ignore the PRIVATE section of the list.
  * Introduce 'lenient' mode for hostname validation.
  * typescript rewrite + toolchain improvements
  * Update travis config
  * Optimizations + idna compaction
  * Allow updating the rules
  * Use minified/optimized version in benchmark
  * Simplify tsconfig

### 2.3.1 (2018/02/18 17:59 +00:00)
- [#116](https://github.com/oncletom/tld.js/pull/116) Publish bundles to npm (@chrmod)

### v2.3.0 (2018/02/02 14:13 +00:00)
- [#108](https://github.com/oncletom/tld.js/pull/108) Add ip validation (@remusao)
- [#113](https://github.com/oncletom/tld.js/pull/113) bundles it for the browser (@srashid5)
- [#105](https://github.com/oncletom/tld.js/pull/105) Activating Open Collective (@oncletom, @xdamman)
- [#115](https://github.com/oncletom/tld.js/pull/115) Use Firefox Headless for CI testing (@oncletom)

### v2.2.0 (2017/09/10 08:45 +00:00)
- [#103](https://github.com/oncletom/tld.js/pull/103) API addition proposal + remove redundancy (@remusao)
- [#98](https://github.com/oncletom/tld.js/pull/98) Add a benchmark script to tld.js to measure performance evolution (@remusao, @oncletom)

### v2.1.0 (2017/09/01 18:32 +00:00)
- [#97](https://github.com/oncletom/tld.js/pull/97) Implement rules using a trie data structure. (@remusao)

### v2.0.0 (2017/07/19 08:36 +00:00)
- [#92](https://github.com/oncletom/tld.js/pull/92) Remove polyfills (#92) (@oncletom)
- [#96](https://github.com/oncletom/tld.js/pull/96) Add support for fully qualified domains (trailing dot in domain name) (#96) (@remusao)
- [#91](https://github.com/oncletom/tld.js/pull/91) Bundle rules.json on prepublish (#91) (@oncletom)
- [#90](https://github.com/oncletom/tld.js/pull/90) Remove bower and component support (#90) (@oncletom)
- [#87](https://github.com/oncletom/tld.js/pull/87) Expose bound methods (#87) (@oncletom)
- [#88](https://github.com/oncletom/tld.js/pull/88) Upgrade development dependencies (#88) (@oncletom)

### v1.7.0 (2016/09/13 19:44 +00:00)
- [#84](https://github.com/oncletom/tld.js/pull/84) Add an interactive update system (#84) (@oncletom)
- [#83](https://github.com/oncletom/tld.js/pull/83) Rectify the `tldExists("google.google")` README example (#83) (@oncletom)

### v1.6.3 (2016/09/13 17:07 +00:00)
- [#81](https://github.com/oncletom/tld.js/pull/81) Publish to npm via Travis CI (#81) (@oncletom)
- [#80](https://github.com/oncletom/tld.js/pull/80) Do not require end-users to have `npm@2` (#80) (@oncletom)

### v1.6.2 (2015/11/17 16:24 +00:00)
- [#72](https://github.com/oncletom/tld.js/pull/72) Update rules to remove support for .an TLD (@oncletom)

### v1.6.1 (2015/11/03 09:12 +00:00)
- [#70](https://github.com/oncletom/tld.js/pull/70) Update rules.json (@Kureev)

### v1.6.0 (2015/10/26 18:31 +00:00)
- [#67](https://github.com/oncletom/tld.js/pull/67) Expose the updater as a lib function (@oncletom)
- [#68](https://github.com/oncletom/tld.js/pull/68) Add tld.validHosts (@oncletom)

### v1.5.5 (2015/10/13 21:04 +00:00)
- [#65](https://github.com/oncletom/tld.js/pull/65) Make sure we do not commit bower_components folder (@oncletom)

### v1.5.4 (2015/09/17 10:59 +00:00)
- [#60](https://github.com/oncletom/tld.js/pull/60) Update cleanHostValue so it never returns invalid hostname characters (@myndzi)
- [#62](https://github.com/oncletom/tld.js/pull/62) Adding tests for `getPublicSuffix` (@oncletom)
- [#61](https://github.com/oncletom/tld.js/pull/61) Build against all major nodejs and iojs versions (@jdesboeufs)

### v1.5.3 (2015/06/19 11:09 +00:00)
- [#55](https://github.com/oncletom/tld.js/pull/55) Url parse (@myndzi)

### v1.5.2 (2015/01/15 09:56 +00:00)
- [#52](https://github.com/oncletom/tld.js/pull/52) Make rules with no exceptions valid (@GreyKn)

### 1.5.1 (2014/10/08 11:30 +00:00)
- [#50](https://github.com/oncletom/tld.js/pull/50) 93% to 97% CI code coverage. (@oncletom)
- [#49](https://github.com/oncletom/tld.js/pull/49) URL as a parameter in path broke `cleanHostValue` (@oncletom)
- [#44](https://github.com/oncletom/tld.js/pull/44) Fix typo in README. (@ghostwords)

### 1.3.3 (2014/05/21 14:39 +00:00)
- [#41](https://github.com/oncletom/tld.js/pull/41) Remove url fragments from host name (@jhnns)

### 1.3.2 (2014/05/07 08:35 +00:00)
- [#39](https://github.com/oncletom/tld.js/pull/39) Use publicsuffix.org instead of hg.mozilla.org (@Krinkle)

### 1.3.1 (2014/01/17 13:20 +00:00)
- [#36](https://github.com/oncletom/tld.js/pull/36) Remove grunt dependency (@oncletom)
- [#35](https://github.com/oncletom/tld.js/pull/35) [WIP] tldjs gives inconsistent results (@oncletom)
- [#33](https://github.com/oncletom/tld.js/pull/33) tldjs chokes on weird domains (@oncletom)

### 1.3.0 (2013/11/07 15:21 +00:00)
- [#32](https://github.com/oncletom/tld.js/pull/32) add support for component.io (@olivoil)
- [#31](https://github.com/oncletom/tld.js/pull/31) Browser feature (@oncletom)
- [#29](https://github.com/oncletom/tld.js/pull/29) Grunt 0.4 and Node 0.10 compatibility (@oncletom)

### 1.1.2 (2013/01/08 13:31 +00:00)
- [#13](https://github.com/oncletom/tld.js/pull/13) add getSubdomain() (@oncletom)
- [#14](https://github.com/oncletom/tld.js/pull/14) add domainExists() (@oncletom)
- [#24](https://github.com/oncletom/tld.js/pull/24) isValid() does the wrong job (@oncletom)
- [#3](https://github.com/oncletom/tld.js/pull/3) Test Rule object (@oncletom)
- [#23](https://github.com/oncletom/tld.js/pull/23) Bumping request version (@oncletom)

### 1.1.0 (2012/12/31 12:12 +00:00)
- [#11](https://github.com/oncletom/tld.js/pull/11) rules as regexp (@oncletom)
- [#9](https://github.com/oncletom/tld.js/pull/9) Migrate build task as a Grunt task (@oncletom)

### 1.0.2 (2012/12/06 15:51 +00:00)
- [#7](https://github.com/oncletom/tld.js/pull/7) checkPublicSuffix('example.example', 'example.example'); is failing (@oncletom)
- [#6](https://github.com/oncletom/tld.js/pull/6) Updated the rules from http://publicsuffix.org/ (@yehezkielbs)
