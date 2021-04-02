# tldts - Blazing Fast URL Parsing

[![NPM](https://nodei.co/npm/tldts.png?downloads=true&downloadRank=true)](https://nodei.co/npm/tldts/)

[![Build Status][badge-ci]](http://travis-ci.org/remusao/tldts) ![][badge-downloads]
[![Known Vulnerabilities](https://snyk.io/test/github/remusao/tldts/badge.svg?targetFile=package.json)](https://snyk.io/test/github/remusao/tldts?targetFile=package.json)

`tldts` is a JavaScript library to extract hostnames, domains, public suffixes, top-level domains and subdomains from URLs.

**Features**:
1. Tuned for **performance** (order of 0.1 to 1 μs per input)
2. Handles both URLs and hostnames
3. Full Unicode/IDNA support
4. Support parsing email addresses
5. Detect IPv4 and IPv6 addresses
6. Continuously updated version of the public suffix list
7. **TypeScript**, ships with `umd`, `esm`, `cjs` bundles and *type definitions*
8. Small bundles and small memory footprint
9. Battle tested: full test coverage and production use

# Install

```bash
npm install --save tldts
```

# Usage

Using the command-line interface:
```js
$ npx tldts 'http://www.writethedocs.org/conf/eu/2017/'
{
  "domain": "writethedocs.org",
  "domainWithoutSuffix": "writethedocs",
  "hostname": "www.writethedocs.org",
  "isIcann": true,
  "isIp": false,
  "isPrivate": false,
  "publicSuffix": "org",
  "subdomain": "www"
}
```

Or from the command-line in batch:
```js
$ echo "http://www.writethedocs.org/\nhttps://example.com" | npx tldts
{
  "domain": "writethedocs.org",
  "domainWithoutSuffix": "writethedocs",
  "hostname": "www.writethedocs.org",
  "isIcann": true,
  "isIp": false,
  "isPrivate": false,
  "publicSuffix": "org",
  "subdomain": "www"
}
{
  "domain": "example.com",
  "domainWithoutSuffix": "example",
  "hostname": "example.com",
  "isIcann": true,
  "isIp": false,
  "isPrivate": false,
  "publicSuffix": "com",
  "subdomain": ""
}
```

Programmatically:
```js
const { parse } = require('tldts');

// Retrieving hostname related informations of a given URL
parse('http://www.writethedocs.org/conf/eu/2017/');
// { domain: 'writethedocs.org',
//   domainWithoutSuffix: 'writethedocs',
//   hostname: 'www.writethedocs.org',
//   isIcann: true,
//   isIp: false,
//   isPrivate: false,
//   publicSuffix: 'org',
//   subdomain: 'www' }
```

Modern *ES6 modules import* is also supported:

```js
import { parse } from 'tldts';
```

Alternatively, you can try it *directly in your browser* here: https://npm.runkit.com/tldts

Check [README.md](/packages/tldts/README.md) for more details about the API.

## Contributors

`tldts` is based upon the excellent `tld.js` library and would not exist without
the [many contributors](https://github.com/remusao/tldts/graphs/contributors) who worked on the project.

This project would not be possible without the amazing Mozilla's
[public suffix list][] either. Thank you for your hard work!

# License

[MIT License](LICENSE).

[badge-ci]: https://secure.travis-ci.org/remusao/tldts.svg?branch=master
[badge-downloads]: https://img.shields.io/npm/dm/tldts.svg

[public suffix list]: https://publicsuffix.org/list/
[list the recent changes]: https://github.com/publicsuffix/list/commits/master
[changes Atom Feed]: https://github.com/publicsuffix/list/commits/master.atom

[public suffix]: https://publicsuffix.org/learn/
