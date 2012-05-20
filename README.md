tld.js
======

[![Build Status](https://secure.travis-ci.org/oncletom/tld.js.png?branch=master)](http://travis-ci.org/oncletom/tld.js)

Handful API to do stuff with domain names and URIs: validity, public etc.

Its main purpose is to check if a domain name is valid upon. 2 constraints:
* an up-to-date TLDs database
* must work in node.js and the browser

It is based on the [public suffix list](http://publicsuffix.org/list/) provided by Mozilla.
Thanks Mozilla!

## Usage

*tld.js* is available under [NPM](http://npmjs.org/) registry.

```javascript
npm install tldjs --save
```

And to include it in any relevant script:

```javascript
var tld = require('tldjs');
```

### getDomain()

```javascript
tld.getDomain('google.com'); // returns `google.com`
tld.getDomain('fr.google.com'); // returns `google.com`
tld.getDomain('google.co.uk'); // returns `google.co.uk`
tld.getDomain('foo.google.co.uk'); // returns `google.co.uk`
tld.getDomain('t.co'); // returns `t.co`
tld.getDomain('fr.t.co'); // returns `t.co`
```

### isValid()

```javascript
tld.isValid('google.com'); // returns `true`
tld.isValid('t.co'); // returns `true`
tld.isValid('t.go'); // returns `false`

```

## Browser-side

**Notice**: this part has not been developed yet.

The library is designed to be useable on the browser-side, in an framework agnostic fashion. No `jQuery.tld()`.

```javascript
<script src="/path/to/tld.js"></script>
<script>
tld.getDomain(window.location.host); //returns the current domain
</script>
```

## Rebuilding TLDs List

Many libraries offer a list of TLDs. But, are they up-to-date? And how to update them?

Hopefully for you, even if I'm flying over the world, if I've lost my Internet connection or even if
you do manage your own list, you can update it by yourself, painlessly.

How? By typing this in your console

```bash
npm run-script build
```

A fresh copy will be located in `src/rules.json`.


## Contributing

Provide a pull request (with tested code) to include your work in this main project.
Issues may be awaiting for help so feel free to give a hand, with code or ideas.