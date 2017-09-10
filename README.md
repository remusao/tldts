# tld.js [![Build Status][badge-ci]](http://travis-ci.org/oncletom/tld.js) ![][badge-downloads]

> `tld.js` is JavaScript API to work against complex domain names, subdomains and well-known TLDs.

It answers with accuracy to questions like _what is `mail.google.com` domain?_,  _what is `a.b.ide.kyoto.jp` subdomain?_ and _is `https://big.data` TLD a well-known one?_.

`tld.js` [runs fast](#performances), is fully tested and works both in Node.js and in the browser. Because it relies on Mozilla's [public suffix list][], now is a good time to say _thank you_ Mozilla!

# Install

```bash
# With bundled Top Level Domains list
npm install --save tldjs

# You can get an up-to-date Top Level Domains list during the install
npm install --save tldjs --tldjs-update-rules
```

The latter is useful if this package has not been published for a while on _npm_.

# Using It

## Node.js

```javascript
const { parse } = require('tldjs');

parse('mail.google.co.uk');
{ hostname: 'mail.google.co.uk',
  isValid: true,
  tldExists: true,
  publicSuffix: 'co.uk',
  domain: 'google.co.uk',
  subdomain: 'mail' }
```

## Browser

A browser version is made available thanks to [browserify CDN][].

```html
<script src="https://wzrd.in/standalone/tldjs">
<script>
tldjs.parse('mail.google.co.uk');
// { hostname: 'mail.google.co.uk',
//   isValid: true,
//   tldExists: true,
//   publicSuffix: 'co.uk',
//   domain: 'google.co.uk',
//   subdomain: 'mail' }
</script>
```

You can build your own browser bundle with [browserify][]:

```bash
npm install --save browserify
browserify -s tld -r tldjs -o tld.js
```

An [UMD module](https://github.com/umdjs/umd) will be created as of `tld.js`.

# API

`tldjs` can be use either as a whole, or using *destructuring*.

```js
// ES2015 modules syntax
import tldjs from 'tldjs';
import { parse } from 'tldjs';

// Node/CommonJS modules syntax
const tldjs = require('tldjs');
const { parse } = require('tldjs');
```

## `tldjs.parse()`

This methods returns handy **properties about a URL or a hostname**.

```js
const tldjs = require('tldjs');

tldjs.parse('https://www.npmjs.com/package/tldjs');
// { hostname: 'www.npmjs.com',
//   isValid: true,
//   tldExists: true,
//   publicSuffix: 'com',
//   domain: 'npmjs.com',
//   subdomain: 'www' }

tldjs.parse('gopher://domain.unknown/');
// { hostname: 'domain.unknown',
//   isValid: true,
//   tldExists: false,
//   publicSuffix: 'unknown',
//   domain: 'domain.unknown',
//   subdomain: '' }
//

tldjs.parse('community.brave.com');
// { hostname: 'community.brave.com',
//   isValid: true,
//   tldExists: true,
//   publicSuffix: 'com',
//   domain: 'brave.com',
//   subdomain: 'community' }
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

These methods are shorthands if you want to retrieve only a single value

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

```
While interpreting the results, keep in mind that each "op" reported by the benchmark is processing 24 domains
tldjs#isValid x 230,353 ops/sec ±10.99% (44 runs sampled)
tldjs#extractHostname x 42,333 ops/sec ±2.82% (85 runs sampled)
tldjs#tldExists x 15,083 ops/sec ±8.76% (54 runs sampled)
tldjs#getPublicSuffix x 14,334 ops/sec ±8.00% (80 runs sampled)
tldjs#getDomain x 15,092 ops/sec ±1.92% (84 runs sampled)
tldjs#getSubdomain x 13,202 ops/sec ±3.66% (72 runs sampled)
tldjs#parse x 8,561 ops/sec ±11.78% (55 runs sampled)
```

You can measure the performance of `tld.js` on your hardware by running the following command:

```bash
npx tldjs -c './bin/benchmark.js'
```

# License

[MIT License](LICENSE).

[badge-ci]: https://secure.travis-ci.org/oncletom/tld.js.svg?branch=master
[badge-downloads]: https://img.shields.io/npm/dm/tldjs.svg

[public suffix list]: https://publicsuffix.org/list/
[browserify CDN]: https://wzrd.in/
[browserify]: http://browserify.org/

[`require('url').parse`]: https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost
[public suffix]: https://publicsuffix.org/learn/
