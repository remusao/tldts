# tldts - Hostname and Domain Parsing using Public Suffix Lists

[![NPM](https://nodei.co/npm/tldts.png?downloads=true&downloadRank=true)](https://nodei.co/npm/tldts/)

[![Build Status][badge-ci]](http://travis-ci.org/remusao/tldts) ![][badge-downloads]
![Coverage Status](https://coveralls.io/repos/github/remusao/tldts/badge.svg?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/remusao/tldts/badge.svg?targetFile=package.json)](https://snyk.io/test/github/remusao/tldts?targetFile=package.json)


> `tldts` is a Typescript library to parse hostnames, domains, public suffixes, top-level domains and subdomains from URLs.


**Features**:
1. **Fastest library** around (up to 2M operations per second, that's 3 orders of
   magnitude faster than the most popular library out there)
2. Written in **TypeScript**, ships with `umd`, `esm`, `cjs` bundles and *type definitions*
3. Full Unicode/IDNA support
4. Support both ICANN and Private suffixes
5. Ships with continuously updated version of the list: it works *out of the box*!
6. Support parsing full URLs or hostnames
7. Small bundles and small memory footprint

# Install

```bash
npm install --save tldts
```

# Usage

```js
const tldts = require('tldts');

// Retrieving hostname related informations of a given URL
parse('http://www.writethedocs.org/conf/eu/2017/');
// { domain: 'writethedocs.org',
//   hostname: 'www.writethedocs.org',
//   isIcann: true,
//   isIp: false,
//   isPrivate: false,
//   publicSuffix: 'org',
//   subdomain: 'www' }
```

# API

* `tldts.parse(url | hostname, options)`
* `tldts.getHostname(url | hostname, options)`
* `tldts.getDomain(url | hostname, options)`
* `tldts.getPublicSuffix(url | hostname, options)`
* `tldts.getSubdomain(url, | hostname, options)`

The behavior of `tldts` can be customized using an `options` argument for all
the functions exposed as part of the public API.

```js
{
  // Use suffixes from ICANN section (default: true)
  allowIcannDomains: boolean;
  // Use suffixes from Private section (default: false)
  allowPrivateDomains: boolean;
  // Extract and validate hostname (default: true)
  extractHostname: boolean;
  // Specifies extra valid suffixes (default: null)
  validHosts: string[] | null;
}
```

The `parse` method returns handy **properties about a URL or a hostname**.

```js
const tldts = require('tldts');

tldts.parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv');
// { domain: 'amazonaws.com',
//   hostname: 'spark-public.s3.amazonaws.com',
//   isIcann: true,
//   isIp: false,
//   isPrivate: false,
//   publicSuffix: 'com',
//   subdomain: 'spark-public.s3' }

tldts.parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv', { allowPrivateDomains: true })
// { domain: 'spark-public.s3.amazonaws.com',
//   hostname: 'spark-public.s3.amazonaws.com',
//   isIcann: false,
//   isIp: false,
//   isPrivate: true,
//   publicSuffix: 's3.amazonaws.com',
//   subdomain: '' }

tldts.parse('gopher://domain.unknown/');
// { domain: 'domain.unknown',
//   hostname: 'domain.unknown',
//   isIcann: false,
//   isIp: false,
//   isPrivate: true,
//   publicSuffix: 'unknown',
//   subdomain: '' }

tldts.parse('https://192.168.0.0') // IPv4
// { domain: null,
//   hostname: '192.168.0.0',
//   isIcann: null,
//   isIp: true,
//   isPrivate: null,
//   publicSuffix: null,
//   subdomain: null }

tldts.parse('https://[::1]') // IPv6
// { domain: null,
//   hostname: '::1',
//   isIcann: null,
//   isIp: true,
//   isPrivate: null,
//   publicSuffix: null,
//   subdomain: null }
```

| Property Name  | Type   | Description                                 |
|:-------------- |:------ |:------------------------------------------- |
| `hostname`     | `str`  | `hostname` of the input extracted automatically |
| `domain`       | `str`  | Domain (tld + sld)                          |
| `subdomain`    | `str`  | Sub domain (what comes after `domain`)      |
| `publicSuffix` | `str`  | Public Suffix (tld) of `hostname`           |
| `isIcann`      | `bool` | Does TLD come from ICANN part of the list   |
| `isPrivate`    | `bool` | Does TLD come from Private part of the list |
| `isIP`         | `bool` | Is `hostname` an IP address?                |


## Single purpose methods

These methods are shorthands if you want to retrieve only a single value (and
will perform better than `parse` because less work will be needed).

### getDomain(url | hostname, options?)

Returns the fully qualified domain from a given string.

```javascript
const { getDomain } = require('tldts');

getDomain('google.com');        // returns `google.com`
getDomain('fr.google.com');     // returns `google.com`
getDomain('fr.google.google');  // returns `google.google`
getDomain('foo.google.co.uk');  // returns `google.co.uk`
getDomain('t.co');              // returns `t.co`
getDomain('fr.t.co');           // returns `t.co`
getDomain('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `example.co.uk`
```

### getSubdomain(url | hostname, options?)

Returns the complete subdomain for a given string.

```javascript
const { getSubdomain } = require('tldts');

getSubdomain('google.com');             // returns ``
getSubdomain('fr.google.com');          // returns `fr`
getSubdomain('google.co.uk');           // returns ``
getSubdomain('foo.google.co.uk');       // returns `foo`
getSubdomain('moar.foo.google.co.uk');  // returns `moar.foo`
getSubdomain('t.co');                   // returns ``
getSubdomain('fr.t.co');                // returns `fr`
getSubdomain('https://user:password@secure.example.co.uk:443/some/path?and&query#hash'); // returns `secure`
```

### getPublicSuffix(url | hostname, options?)

Returns the [public suffix][] for a given string.

```javascript
const { getPublicSuffix } = require('tldts');

getPublicSuffix('google.com');       // returns `com`
getPublicSuffix('fr.google.com');    // returns `com`
getPublicSuffix('google.co.uk');     // returns `co.uk`
getPublicSuffix('s3.amazonaws.com'); // returns `com`
getPublicSuffix('s3.amazonaws.com', { allowPrivateDomains: true }); // returns `s3.amazonaws.com`
getPublicSuffix('tld.is.unknown');   // returns `unknown`
```

# Troubleshooting

## Retrieving subdomain of `localhost` and custom hostnames

`tldts` methods `getDomain` and `getSubdomain` are designed to **work only with *known and valid* TLDs**.
This way, you can trust what a domain is.

`localhost` is a valid hostname but not a TLD. You can pass additional options to each method exposed by `tldts`:

```js
const tldts = require('tldts');

tldts.getDomain('localhost');           // returns null
tldts.getSubdomain('vhost.localhost');  // returns null

tldts.getDomain('localhost', { validHosts: ['localhost'] }); // returns 'localhost'
tldts.getSubdomain('vhost.localhost', { validHosts: ['localhost'] });  // returns 'vhost'
```

## Updating the TLDs List

`tldts` made the opinionated choice of shipping with a list of suffixes directly
in its bundle. There is currently no mechanism to update the lists yourself, but
we make sure that the version shipped is always up-to-date.

If you keep `tldts` updated, the lists should be up-to-date as well!

# Performance

`tldts` is the *fastest JavaScript library* available for parsing
hostnames. It is able to parse up to **2M hostnames per second** on a
modern i7-8550U CPU with Node.js version 11.6.0.

Please see [this detailed comparison](./comparison/comparison.md) with other available libraries.

## Experimental Bundle

`tldts` ships with two bundles, the default one is what you should use and what
is imported out of the box. It makes use of an optimized DAWG (direct acyclic
word graph) data-structure and delivers very good performances. If that is not
enough, you can try the `tldts-experimental` bundle which implements a
*probabilistic data-structure*. It is:

* Must smaller (in terms of bundle size and memory footprint)
* Loads instantly (no data loading or parsing required)
* Much faster (lookups are up to 1.5-2x faster)

The drawback is that there might be some *unlikely* false positive (think bloom filters).

For more details, check the documentation from the following files:
* [building](./bin/builders/hashes.js)
* [lookups](./lib/lookup/packed_hashes.ts)

## Contributors

`tldts` is based upon the excellent `tld.js` library and would not exist without
the many contributors who worked on the project:
<a href="graphs/contributors"><img src="https://opencollective.com/tldjs/contributors.svg?width=890" /></a>

This project would not be possible without the amazing Mozilla's
[public suffix list][]. Thank you for your hard work!

# License

[MIT License](LICENSE).

[badge-ci]: https://secure.travis-ci.org/remusao/tldts.svg?branch=master
[badge-downloads]: https://img.shields.io/npm/dm/tldts.svg

[public suffix list]: https://publicsuffix.org/list/
[list the recent changes]: https://github.com/publicsuffix/list/commits/master
[changes Atom Feed]: https://github.com/publicsuffix/list/commits/master.atom

[public suffix]: https://publicsuffix.org/learn/
