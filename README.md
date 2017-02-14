# tld.js [![Build Status](https://secure.travis-ci.org/oncletom/tld.js.svg?branch=master)](http://travis-ci.org/oncletom/tld.js)

> `tld.js` is JavaScript API to work against complex domain names, subdomains and URIs.

It answers with accuracy to questions like *what is the domain/subdomain of `mail.google.com` and `a.b.ide.kyoto.jp`?*

`tld.js` is fully tested, works in Node.js and in the browser, with or without AMD.
A database of valid Top Level Domains is kept up to date thanks to Mozilla's [public suffix list](http://publicsuffix.org/list/).

Thanks Mozilla!

# Install

```bash
# With bundled Top Level Domains list
npm install --save tldjs

# Update Top Level Domains list during install
npm install --save tldjs --tldjs-update-rules
```

The latter is useful if this package has not been published for a while on _npm_.

# Using It

## Node.js

```javascript
const { getDomain } = require('tldjs');

getDomain('mail.google.co.uk');
// -> 'google.co.uk'
```

## Browser

A browser version is made available thanks to [Browserify CDN](http://wzrd.in/).

```html
<script src="http://wzrd.in/standalone/tldjs">
<script>
tldjs.getDomain('mail.google.co.uk');
// -> 'google.co.uk'
</script>
```

You can build your own by using [browserify](http://browserify.org/):

```bash
npm install --save tldjs
browserify -s tld -r tldjs -o tld.js
```

An [UMD module](https://github.com/umdjs/umd) will be created as of `tld.js`.

# API

`tldjs` can be use either as a whole, or using *destructuring*.

```js
// ES2015 modules syntax
import tldjs from 'tldjs';
import { getDomain } from 'tldjs';

// Node/CommonJS modules syntax
const tldjs = require('tldjs');
const { getDomain } = require('tldjs');
```

## tldExists()

Checks if the TLD is valid for a given host.

```javascript
const { tldExists } = tldjs;

tldExists('google.com'); // returns `true`
tldExists('google.local'); // returns `false` (not an explicit registered TLD)
tldExists('com'); // returns `true`
tldExists('uk'); // returns `true`
tldExists('co.uk'); // returns `true` (because `uk` is a valid TLD)
tldExists('amazon.fancy.uk'); // returns `true` (still because `uk` is a valid TLD)
tldExists('amazon.co.uk'); // returns `true` (still because `uk` is a valid TLD)
tldExists('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `true`
```

## getDomain()

Returns the fully qualified domain from a host string.

```javascript
const { getDomain } = tldjs;

getDomain('google.com'); // returns `google.com`
getDomain('fr.google.com'); // returns `google.com`
getDomain('fr.google.google'); // returns `google.google`
getDomain('foo.google.co.uk'); // returns `google.co.uk`
getDomain('t.co'); // returns `t.co`
getDomain('fr.t.co'); // returns `t.co`
getDomain('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `example.co.uk`
```

## getSubdomain()

Returns the complete subdomain for a given host.

```javascript
const { getSubdomain } = tldjs;

getSubdomain('google.com'); // returns ``
getSubdomain('fr.google.com'); // returns `fr`
getSubdomain('google.co.uk'); // returns ``
getSubdomain('foo.google.co.uk'); // returns `foo`
getSubdomain('moar.foo.google.co.uk'); // returns `moar.foo`
getSubdomain('t.co'); // returns ``
getSubdomain('fr.t.co'); // returns `fr`
getSubdomain('https://user:password@secure.example.co.uk:443/some/path?and&query#hash'); // returns `secure`
```

## getPublicSuffix()

Returns the public suffix for a given host.

```javascript
const { getPublicSuffix } = tldjs;

getPublicSuffix('google.com'); // returns `com`
getPublicSuffix('fr.google.com'); // returns `com`
getPublicSuffix('google.co.uk'); // returns `co.uk`
getPublicSuffix('s3.amazonaws.com'); // returns `s3.amazonaws.com`
```

## isValid()

Checks if the host string is valid.
It does not check if the *tld* exists.

```javascript
const { isValid } = tldjs;

isValid('google.com'); // returns `true`
isValid('.google.com'); // returns `false`
isValid('my.fake.domain'); // returns `true`
isValid('localhost'); // returns `false`
isValid('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `true`
```

# Troubleshouting

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
