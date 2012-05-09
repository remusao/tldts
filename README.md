tld.js
======

Handful API to do stuff with domain names and URIs: validity, public etc.

Its main purpose is to check if a domain name is valid upon. 2 constraints:
* an up-to-date TLDs database
* must work in node.js and the browser

It is based on the [public suffix list](http://publicsuffix.org/list/) provided by Mozilla.  
Thanks Mozilla!

## Usage

### isValid()

```javascript
var tld = require('tld');

tld.isValid('google.com'); // returns `true`
tld.isValid('t.co'); // returns `true`
tld.isValid('t.go'); // returns `false` 

```

### getDomain()

```javascript
var tld = require('tld');

tld.getDomain('google.com'); // returns `google.com`
tld.getDomain('fr.google.com'); // returns `google.com`
tld.getDomain('google.co.uk'); // returns `google.co.uk`
tld.getDomain('foo.google.co.uk'); // returns `google.co.uk`
tld.getDomain('t.co'); // returns `t.co`
tld.getDomain('fr.t.co'); // returns `t.co`
```
## Browser-side

The library is designed to be useable on the browser-side, in an framework agnostic fashion. No `jQuery.tld()`.

```javascript
<script src="/path/to/tld.js"></script>
<script>
tld.getDomain(window.location.host); //returns the current domain
</script>
```


## Contributing

Provide a pull request (with tested code) to include your work in this main project.  
If the database is outdated, just run `npm run-script update` to update the database, then push your code (or use your own fork if I'm too slow).