# tldts - Public Suffix List Parsing

[![NPM](https://nodei.co/npm/tldts.png?downloads=true&downloadRank=true)](https://nodei.co/npm/tldts/)

[![Build Status][badge-ci]](http://travis-ci.org/remusao/tldts) ![][badge-downloads]
[![devDependency Status](https://david-dm.org/remusao/tldts/dev-status.png)](https://david-dm.org/tldts/tldts#info=devDependencies) [![Greenkeeper badge](https://badges.greenkeeper.io/remusao/tldts.svg)](https://greenkeeper.io/)


> `tldts` is a Typescript library to work against complex domain names, subdomains and well-known TLDs. It is a fork of the very good [tld.js](https://github.com/oncletom/tld.js) JavaScript library.

It answers with accuracy to questions like _what is `mail.google.com`'s domain?_,  _what is `a.b.ide.kyoto.jp`'s subdomain?_ and _is `https://big.data`'s TLD a well-known one?_.

`tldts` [runs fast](#performances) (even faster than the original tld.js library thanks to additional optimizations), is fully tested and is safe to use in the browser (UMD bundles are provided as well as an ES6 module version and Typescripts type declarations). Because it relies on Mozilla's [public suffix list][], now is a good time to say _thank you_ Mozilla!

# Install

```bash
# Regular install
npm install --save tldts
```

It ships by default with the latest version of the public suffix lists, but you
can provide your own version (more up-to-date or modified) using the `update`
method.

# Using It

```js
const { parse } = require('tldts');

// Retrieving hostname related informations of a given URL
parse('http://www.writethedocs.org/conf/eu/2017/');
```

⬇️ Read the documentation _below_ to find out the available _functions_.

## `tldts.parse()`

This methods returns handy **properties about a URL or a hostname**.

```js
const tldts = require('tldts');

tldts.parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv');
// { host: 'spark-public.s3.amazonaws.com',
//   isValid: true,
//   isIp: false,
//   publicSuffix: 'com',
//   isIcann: true,
//   isPrivate: false,
//   domain: 'amazonaws.com',
//   subdomain: 'spark-public.s3' }

tldts.parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv', { allowPrivateDomains: true })
// { host: 'spark-public.s3.amazonaws.com',
//   isValid: true,
//   isIp: false,
//   publicSuffix: 's3.amazonaws.com',
//   isIcann: false,
//   isPrivate: true,
//   domain: 'spark-public.s3.amazonaws.com',
//   subdomain: '' }

tldts.parse('gopher://domain.unknown/');
// { host: 'domain.unknown',
//   isValid: true,
//   isIp: false,
//   publicSuffix: 'unknown',
//   isIcann: false,
//   isPrivate: false,
//   domain: 'domain.unknown',
//   subdomain: '' }

tldts.parse('https://192.168.0.0')
// { host: '192.168.0.0',
//   isValid: true,
//   isIp: true,
//   publicSuffix: null,
//   isIcann: null,
//   isPrivate: null,
//   domain: null,
//   subdomain: null }
```

| Property Name     | Type | |
| ---               | ---       | --- |
| `host`            | `String`  | `host` part of the input extracted automatically  |
| `isValid`         | `Boolean` | Is the hostname valid according to the RFC? |
| `publicSuffix`    | `String`  |   |
| `isIcann`         | `Boolean` | Does TLD come from public part of the list  |
| `isPrivate`       | `Boolean` | Does TLD come from private part of the list |
| `domain`          | `String`  |   |
| `subdomain`       | `String`  |   |


## Single purpose methods

These methods are shorthands if you want to retrieve only a single value (and
will perform better than `parse` because less work will be needed).

### getDomain()

Returns the fully qualified domain from a given string.

```javascript
const { getDomain } = tldts;

getDomain('google.com');        // returns `google.com`
getDomain('fr.google.com');     // returns `google.com`
getDomain('fr.google.google');  // returns `google.google`
getDomain('foo.google.co.uk');  // returns `google.co.uk`
getDomain('t.co');              // returns `t.co`
getDomain('fr.t.co');           // returns `t.co`
getDomain('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `example.co.uk`
```

### getSubdomain()

Returns the complete subdomain for a given string.

```javascript
const { getSubdomain } = tldts;

getSubdomain('google.com');             // returns ``
getSubdomain('fr.google.com');          // returns `fr`
getSubdomain('google.co.uk');           // returns ``
getSubdomain('foo.google.co.uk');       // returns `foo`
getSubdomain('moar.foo.google.co.uk');  // returns `moar.foo`
getSubdomain('t.co');                   // returns ``
getSubdomain('fr.t.co');                // returns `fr`
getSubdomain('https://user:password@secure.example.co.uk:443/some/path?and&query#hash'); // returns `secure`
```

### getPublicSuffix()

Returns the [public suffix][] for a given string.

```javascript
const { getPublicSuffix } = tldts;

getPublicSuffix('google.com');       // returns `com`
getPublicSuffix('fr.google.com');    // returns `com`
getPublicSuffix('google.co.uk');     // returns `co.uk`
getPublicSuffix('s3.amazonaws.com'); // returns `com`
getPublicSuffix('s3.amazonaws.com', { allowPrivateDomains: true }); // returns `s3.amazonaws.com`
getPublicSuffix('tld.is.unknown');   // returns `unknown`
```

### isValidHostname()

Checks if the given string is a valid hostname according to [RFC 1035](https://tools.ietf.org/html/rfc1035).
It does not check if the TLD is _well-known_.

```javascript
const { isValidHostname } = tldts;

isValidHostname('google.com');      // returns `true`
isValidHostname('.google.com');     // returns `false`
isValidHostname('my.fake.domain');  // returns `true`
isValidHostname('localhost');       // returns `true`
isValidHostname('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `false`
isValidHostname('192.168.0.0')      // returns `true`
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

Many libraries offer a list of TLDs. But, are they up-to-date? And how to update them?

`tldts` bundles a list of known TLDs but this list can become outdated.
This is especially true if the package have not been updated on npm for a while.

Thankfully for you, you can pass your own version of the list to the `update`
method of `tldts`. It can be fetched from `https://publicsuffix.org/list/public_suffix_list.dat`:

```js
const { update } = require('tldts');

// `tldts` will not fetch the lists for you at the moment, so depending on your
// platform your might use either `fetch` or something else.
update(lists_as_a_string);
```

Open an issue to request an update of the bundled TLDs.

# Contributing

Provide a pull request (with tested code) to include your work in this main project.
Issues may be awaiting for help so feel free to give a hand, with code or ideas.

# Performances

`tldts` is fast, but keep in mind that it might vary depending on your
own use-case. Because the library tried to be smart, the speed can be
drastically different depending on the input (it will be faster if you
provide an already cleaned hostname, compared to a random URL).

On an Intel i7-6600U (2,60-3,40 GHz) using Node.js `v10.9.0`:

## For already cleaned hostnames

| Methods           | ops/sec      |
| ---               | ---          |
| `isValidHostname` | ~`7,500,000` |
| `getHostname`     | ~`3,200,000` |
| `getPublicSuffix` | ~`1,100,000` |
| `getDomain`       | ~`1,100,000` |
| `getSubdomain`    | ~`1,100,000` |
| `parse`           | ~`1,000,000` |


## For random URLs

| Methods           | ops/sec       |
| ---               | ---           |
| `isValidHostname` | ~`12,000,000` |
| `getHostname`     | ~`2,640,000`  |
| `getPublicSuffix` | ~`800,000`    |
| `getDomain`       | ~`760,000`    |
| `getSubdomain`    | ~`760,000`    |
| `parse`           | ~`750,000`    |


You can measure the performance of `tldts` on your hardware by running the following command:

```bash
npm run benchmark
```

_Notice_: if this is not fast enough for your use-case, please get in touch via an issue so that we can analyze that this is so.

## Contributors

This project exists thanks to all the people who contributed to `tld.js` as well as `tldts`. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/tldjs/contributors.svg?width=890" /></a>

# License

[MIT License](LICENSE).

[badge-ci]: https://secure.travis-ci.org/remusao/tldts.svg?branch=master
[badge-downloads]: https://img.shields.io/npm/dm/tldts.svg

[public suffix list]: https://publicsuffix.org/list/
[list the recent changes]: https://github.com/publicsuffix/list/commits/master
[changes Atom Feed]: https://github.com/publicsuffix/list/commits/master.atom

[public suffix]: https://publicsuffix.org/learn/
