# tld.js [![Build Status](https://secure.travis-ci.org/oncletom/tld.js.png?branch=master)](http://travis-ci.org/oncletom/tld.js)

[![browser support](https://ci.testling.com/oncletom/tld.js.png)](https://ci.testling.com/oncletom/tld.js)

Handful API to do stuff with domain names and URIs: validity, public etc.

Its main purpose is to check if a domain name is valid upon. 2 constraints:
* an up-to-date TLDs database
* must work in node.js and the browser

It is based on the [public suffix list](http://publicsuffix.org/list/) provided by Mozilla.

Thanks Mozilla!

# Install

<table>
  <thead>
    <tr>
      <th>`npm`</th>
      <th>`bower`</th>
      <th>`component`</th>
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

tld.getDomain('http://mail.google.co.uk');
// -> 'google.co.uk'
```

## Browser

```
<script src="bower_components/tld/dist/tld.min.js">
<script>
tld.getDomain('http://mail.google.co.uk');
// -> 'google.co.uk'
</script>
```

# API

## getDomain()

Returns the fully qualified domain from a host string.

```javascript
tld.getDomain('google.com'); // returns `google.com`
tld.getDomain('fr.google.com'); // returns `google.com`
tld.getDomain('fr.google.google'); // returns `google.google`
tld.getDomain('foo.google.co.uk'); // returns `google.co.uk`
tld.getDomain('t.co'); // returns `t.co`
tld.getDomain('fr.t.co'); // returns `t.co`
```

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
```

## isValid()

Checks if the host string is valid.
It does not check if the *tld* exists.

```javascript
tld.isValid('google.com'); // returns `true`
tld.isValid('.google.com'); // returns `false`
tld.isValid('my.fake.domain'); // returns `true`
tld.isValid('localhost'); // returns `false`
```

# Troubleshouting

## Updating the TLDs List

Many libraries offer a list of TLDs. But, are they up-to-date? And how to update them?

Hopefully for you, even if I'm flying over the world, if I've lost my Internet connection or even if
you do manage your own list, you can update it by yourself, painlessly.

How? By typing this in your console

```bash
npm run-script build
```

A fresh copy will be located in `src/rules.json`.

Open an issue to request an update in all package systems (or do a PR with a bugfix version bump).


# Contributing

Provide a pull request (with tested code) to include your work in this main project.
Issues may be awaiting for help so feel free to give a hand, with code or ideas.