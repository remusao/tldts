# tld.js [![Build Status](https://secure.travis-ci.org/oncletom/tld.js.png?branch=master)](http://travis-ci.org/oncletom/tld.js)

[![browser support](https://ci.testling.com/oncletom/tld.js.png)](https://ci.testling.com/oncletom/tld.js)

> `tld.js` is JavaScript API to work against complex domain names, subdomains and URIs.

It answers with accuracy to questions like *what is the domain/subdomain of `mail.google.com` and `a.b.ide.kyoto.jp`?*

`tld.js` is fully tested, works in Node.js and in the browser, with or without AMD.
Its database keeps up to date thanks to Mozilla's [public suffix list](http://publicsuffix.org/list/) to have and keep up to date with domain names.

Thanks Mozilla!

# Install

<table>
  <thead>
    <tr>
      <th>npm</th>
      <th>bower</th>
      <th>component</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>npm install --save tldjs</code></td>
      <td><code>bower install --save tld</code></td>
      <td><code>component install tld</code></td>
    </tr>
  </tbody>
</table>


# Using It

## Node.js

```javascript
var tld = require('tldjs');

tld.getDomain('mail.google.co.uk');
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
browserify -s tld -r node_modules/tldjs/index.js -o tld.js
```

An [UMD module](https://github.com/umdjs/umd) will be created as of `tld.js`.

# API

## tldExists()

Checks if the TLD is valid for a given host.

```javascript
tld.tldExists('google.com'); // returns `true`
tld.tldExists('google.google'); // returns `false` (not an explicit registered TLD)
tld.tldExists('com'); // returns `true`
tld.tldExists('uk'); // returns `true`
tld.tldExists('co.uk'); // returns `true` (because `uk` is a valid TLD)
tld.tldExists('amazon.fancy.uk'); // returns `true` (still because `uk` is a valid TLD)
tld.tldExists('amazon.co.uk'); // returns `true` (still because `uk` is a valid TLD)
tld.tldExists('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `true`
```

## getDomain()

Returns the fully qualified domain from a host string.

```javascript
tld.getDomain('google.com'); // returns `google.com`
tld.getDomain('fr.google.com'); // returns `google.com`
tld.getDomain('fr.google.google'); // returns `google.google`
tld.getDomain('foo.google.co.uk'); // returns `google.co.uk`
tld.getDomain('t.co'); // returns `t.co`
tld.getDomain('fr.t.co'); // returns `t.co`
tld.getDomain('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `example.co.uk`
```

## getSubdomain()

Returns the complete subdomain for a given host.

```javascript
tld.getSubdomain('google.com'); // returns ``
tld.getSubdomain('fr.google.com'); // returns `fr`
tld.getSubdomain('google.co.uk'); // returns ``
tld.getSubdomain('foo.google.co.uk'); // returns `foo`
tld.getSubdomain('moar.foo.google.co.uk'); // returns `moar.foo`
tld.getSubdomain('t.co'); // returns ``
tld.getSubdomain('fr.t.co'); // returns `fr`
tld.getSubdomain('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns ``
```

## getPublicSuffix()

Returns the public suffix for a given host.

```javascript
tld.getPublicSuffix('google.com'); // returns `com`
tld.getPublicSuffix('fr.google.com'); // returns `com`
tld.getPublicSuffix('google.co.uk'); // returns `co.uk`
tld.getPublicSuffix('s3.amazonaws.com'); // returns `s3.amazonaws.com`
```

## isValid()

Checks if the host string is valid.
It does not check if the *tld* exists.

```javascript
tld.isValid('google.com'); // returns `true`
tld.isValid('.google.com'); // returns `false`
tld.isValid('my.fake.domain'); // returns `true`
tld.isValid('localhost'); // returns `false`
tld.isValid('https://user:password@example.co.uk:8080/some/path?and&query#hash'); // returns `true`
```

# Troubleshouting

## Updating the TLDs List

Many libraries offer a list of TLDs. But, are they up-to-date? And how to update them?

Hopefully for you, even if I'm flying over the world, if I've lost my Internet connection or even if
you do manage your own list, you can update it by yourself, painlessly.

How? By typing this in your console

```bash
npm run build
```

A fresh copy will be made available as `./rules.json`.

Open an issue to request an update in all package systems (or do a PR with a bugfix version bump).


# Contributing

Provide a pull request (with tested code) to include your work in this main project.
Issues may be awaiting for help so feel free to give a hand, with code or ideas.
