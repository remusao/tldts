# tld.js [![Backers on Open Collective](https://opencollective.com/tldjs/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/tldjs/sponsors/badge.svg)](#sponsors) [![Build Status][badge-ci]](http://travis-ci.org/oncletom/tld.js) ![][badge-downloads]

> `tld.js` is a Node.js module written in JavaScript to work against complex domain names, subdomains and well-known TLDs.

It answers with accuracy to questions like _what is `mail.google.com`'s domain?_,  _what is `a.b.ide.kyoto.jp`'s subdomain?_ and _is `https://big.data`'s TLD a well-known one?_.

`tld.js` [runs fast](#performances), is fully tested and is safe to use in the browser (with [browserify][], webpack and others). Because it relies on Mozilla's [public suffix list][], now is a good time to say _thank you_ Mozilla!

# Install

```bash
# Regular install
npm install --save tldjs

# You can update the list of well-known TLD during the install
npm install --save tldjs --tldjs-update-rules
```

The latter is useful if you significantly rely on an up-to-date list of TLDs. You can [list the recent changes][] ([changes Atom Feed][]) to get a better idea of what is going on in the Public Suffix world.

# Using It

```js
const {parse, tldExists} = require('tldjs');

// Checking only if TLD exists in URL or hostname
// First TLD exists; the second does not.
console.log(tldExists('https://www.bbc'));
console.log(tldExists('tld.unknown'));

// Retrieving hostname related informations of a given URL
parse('http://www.writethedocs.org/conf/eu/2017/');
```

👋 [Try it your browser to see how it works][interactive-example].<br>
⬇️ Read the documentation _below_ to find out the available _functions_.

## `tldjs.parse()`

This methods returns handy **properties about a URL or a hostname**.

```js
const tldjs = require('tldjs');

tldjs.parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv');
// { hostname: 'spark-public.s3.amazonaws.com',
//   isValid: true,
//   isIp: false,
//   tldExists: true,
//   publicSuffix: 's3.amazonaws.com',
//   domain: 'spark-public.s3.amazonaws.com',
//   subdomain: ''
// }

tldjs.parse('gopher://domain.unknown/');
// { hostname: 'domain.unknown',
//   isValid: true,
//   isIp: false,
//   tldExists: false,
//   publicSuffix: 'unknown',
//   domain: 'domain.unknown',
//   subdomain: ''
// }

tldjs.parse('https://192.168.0.0')
// { hostname: '192.168.0.0',
//   isValid: true,
//   isIp: true,
//   tldExists: false,
//   publicSuffix: null,
//   domain: null,
//   subdomain: null
// }
```

| Property Name | Type | |
| ---           | ---       | --- |
| `hostname`    | `String`  |   |
| `isValid`     | `Boolean` | Is the hostname valid according to the RFC?  |
| `tldExists`   | `Boolean` | Is the TLD well-known or not?  |
| `publicSuffix`| `String`  |   |
| `domain`      | `String`  |   |
| `subdomain`   | `String`  |   |


## Single purpose methods

These methods are shorthands if you want to retrieve only a single value.

### tldExists()

Checks if the TLD is _well-known_ for a given hostname — parseable with [`require('url').parse`][].

```javascript
const { tldExists } = tldjs;

tldExists('google.com');      // returns `true`
tldExists('google.local');    // returns `false` (not an explicit registered TLD)
tldExists('com');             // returns `true`
tldExists('uk');              // returns `true`
tldExists('co.uk');           // returns `true` (because `uk` is a valid TLD)
tldExists('amazon.fancy.uk'); // returns `true` (still because `uk` is a valid TLD)
tldExists('amazon.co.uk');    // returns `true` (still because `uk` is a valid TLD)
tldExists('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `true`
```

### getDomain()

Returns the fully qualified domain from a given string — parseable with [`require('url').parse`][].

```javascript
const { getDomain } = tldjs;

getDomain('google.com');        // returns `google.com`
getDomain('fr.google.com');     // returns `google.com`
getDomain('fr.google.google');  // returns `google.google`
getDomain('foo.google.co.uk');  // returns `google.co.uk`
getDomain('t.co');              // returns `t.co`
getDomain('fr.t.co');           // returns `t.co`
getDomain('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `example.co.uk`
```

### getSubdomain()

Returns the complete subdomain for a given string — parseable with [`require('url').parse`][].

```javascript
const { getSubdomain } = tldjs;

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

Returns the [public suffix][] for a given string — parseable with [`require('url').parse`][].

```javascript
const { getPublicSuffix } = tldjs;

getPublicSuffix('google.com');       // returns `com`
getPublicSuffix('fr.google.com');    // returns `com`
getPublicSuffix('google.co.uk');     // returns `co.uk`
getPublicSuffix('s3.amazonaws.com'); // returns `s3.amazonaws.com`
getPublicSuffix('tld.is.unknown');   // returns `unknown`
```

### isValid()

Checks the validity of a given string — parseable with [`require('url').parse`][].
It does not check if the TLD is _well-known_.

```javascript
const { isValid } = tldjs;

isValid('google.com');      // returns `true`
isValid('.google.com');     // returns `false`
isValid('my.fake.domain');  // returns `true`
isValid('localhost');       // returns `false`
isValid('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `true`
isValid('192.168.0.0')      // returns `true`
```

# Troubleshooting

## Retrieving subdomain of `localhost` and custom hostnames

`tld.js` methods `getDomain` and `getSubdomain` are designed to **work only with *known and valid* TLDs**.
This way, you can trust what a domain is.

`localhost` is a valid hostname but not a TLD. Although you can instanciate your own flavour of `tld.js` with *additional valid hosts*:

```js
const tldjs = require('tldjs');

tldjs.getDomain('localhost');           // returns null
tldjs.getSubdomain('vhost.localhost');  // returns null

const myTldjs = tldjs.fromUserSettings({
  validHosts: ['localhost']
});

myTldjs.getDomain('localhost');           // returns 'localhost'
myTldjs.getSubdomain('vhost.localhost');  // returns 'vhost'
```

## Updating the TLDs List

Many libraries offer a list of TLDs. But, are they up-to-date? And how to update them?

`tld.js` bundles a list of known TLDs but this list can become outdated.
This is especially true if the package have not been updated on npm for a while.

Hopefully for you, even if I'm flying over the world, if I've lost my Internet connection or even if
you do manage your own list, you can update it by yourself, painlessly.

How? By passing the `--tldjs-update-rules` to your `npm install` command:

```bash
# anytime you reinstall your project
npm install --tldjs-update-rules

# or if you add the dependency to your project
npm install --save tldjs --tldjs-update-rules
```

Open an issue to request an update of the bundled TLDs.


# Contributing

Provide a pull request (with tested code) to include your work in this main project.
Issues may be awaiting for help so feel free to give a hand, with code or ideas.

# Performances

`tld.js` is fast, but keep in mind that it might vary depending on your own
use-case. Because the library tried to be smart, the speed can be drastically
different depending on the input (it will be faster if you provide an already
cleaned hostname, compared to a random URL).

On an Intel i7-6600U (2,60-3,40 GHz):

## For already cleaned hostnames

| Methods           | ops/sec      |
| ---               | ---          |
| `isValid`         | ~`8,700,000` |
| `extractHostname` | ~`8,100,000` |
| `tldExists`       | ~`2,000,000` |
| `getPublicSuffix` | ~`1,130,000` |
| `getDomain`       | ~`1,000,000` |
| `getSubdomain`    | ~`1,000,000` |
| `parse`           | ~`850,000`   |


## For random URLs

| Methods           | ops/sec       |
| ---               | ---           |
| `isValid`         | ~`25,400,000` |
| `extractHostname` | ~`400,000`    |
| `tldExists`       | ~`310,000`    |
| `getPublicSuffix` | ~`240,000`    |
| `getDomain`       | ~`240,000`    |
| `getSubdomain`    | ~`240,000`    |
| `parse`           | ~`230,000`    |


You can measure the performance of `tld.js` on your hardware by running the following command:

```bash
npm run benchmark
```

_Notice_: if this is not fast enough for your use-case, keep in mind that you can
provide your own `extractHostname` function (which is the bottleneck in
this benchmark) to `tld.js`.

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/tldjs/contributors.svg?width=890" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/tldjs#backer)]

<a href="https://opencollective.com/tldjs#backers" target="_blank"><img src="https://opencollective.com/tldjs/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/tldjs#sponsor)]

<a href="https://opencollective.com/tldjs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/tldjs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/tldjs/sponsor/9/avatar.svg"></a>


# License

[MIT License](LICENSE).

[badge-ci]: https://secure.travis-ci.org/oncletom/tld.js.svg?branch=master
[badge-downloads]: https://img.shields.io/npm/dm/tldjs.svg

[public suffix list]: https://publicsuffix.org/list/
[list the recent changes]: https://github.com/publicsuffix/list/commits/master
[changes Atom Feed]: https://github.com/publicsuffix/list/commits/master.atom
[browserify CDN]: https://wzrd.in/
[browserify]: http://browserify.org/
[interactive-example]: https://runkit.com/oncletom/tld.js-runkit-example

[`require('url').parse`]: https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost
[public suffix]: https://publicsuffix.org/learn/
