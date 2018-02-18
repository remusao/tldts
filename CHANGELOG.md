## Change Log

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