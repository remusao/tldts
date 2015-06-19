# Changelog

## 1.5.3

 * Punycode decoding of hostname strings ([#55](https://github.com/oncletom/tld.js/pull/55))
 * Domain extraction bug fixed ([#53](https://github.com/oncletom/tld.js/issues/53))
 * Dealing with invalid host name fixed ([#54](https://github.com/oncletom/tld.js/issues/54))

## 1.5.2

 * Make rules with no exceptions valid ([#52](https://github.com/oncletom/tld.js/pull/52))

## 1.5.1

 * Increased code coverage to 97% ([#50](https://github.com/oncletom/tld.js/pull/50))
 * An URL in the path portion would return an invalid host value ([#48](https://github.com/oncletom/tld.js/issues/48))

## 1.5.0

 * Added `getPublicSuffix` method ([#30](https://github.com/oncletom/tld.js/pull/30))
 * Removed Node 0.8 compatiblity

## 1.4.2

* Reverted back the lodash change, as it is doubling the browser build file size

## 1.4.1

* IE8 functions shims replaced by lodash ones

## 1.4.0

* Browserify CDN is now favoured over shipping static files in the Github repository
* the legacy rules file format has been removed
* Added IE8 compatibility ([#43](https://github.com/oncletom/tld.js/pull/43))

## 1.3.1

* fixed bad tld escaping for `tld.getSubdomain` ([#33](https://github.com/oncletom/tld.js/issue/33))
* fixed rule order inconsistency caused by `tld.getDomain` ([#35](https://github.com/oncletom/tld.js/issue/35))
* Grunt is no longer a needed dependency ([#36](https://github.com/oncletom/tld.js/issue/36))
* updated PublicSuffix rules

## 1.3.0

* added browser compatibility
* availability for [component.io](http://component.io/) and [bower](http://bower.io/) package managers
* updated rules

## 1.2.0

* removed `node 0.6` compat
* added `node 0.10` compat
* switched to `grunt 0.4`

## 1.1.2

Subtle fixes and new non-breaking methods.

* fixed `isValid` documentation ([#24](https://github.com/oncletom/tld.js/issue/24))
* added `getSubdomain` method ([#13](https://github.com/oncletom/tld.js/issue/13))
* added `domainExists` method ([#14](https://github.com/oncletom/tld.js/issue/14))
* added tests and fixes for the `Rule` object ([#3](https://github.com/oncletom/tld.js/issue/3))

## 1.1.1

Hotfix release.

* fixed `package.json` engines config; the package was impossible to install

## 1.1

Nothing new: only optimization and cleanup.

There is a **Backward Compatibility Break** if you used directly `rules.json`. Format has changed.
Use `rules-legacy.json` to benefit from the formatted data from version `1.0.x`.

* builder now relies on [grunt](http://gruntjs.com/)
* reduced the number of dependencies, all of them are `devDependencies` specific only
* reduced the filesize of `rules.json` (from 600K to less than 60K, it's about 21K gzipped)

## 1.0.3

* updated `rules.json` with latest public rules change

## 1.0.2

* updated `rules.json` with latest public rules change
* altered behavior for unknown TLD according to publicsuffix.org rules change

## 1.0.1

* bugfix
