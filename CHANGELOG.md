# Changelog

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
