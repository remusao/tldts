# tldts - Blazing Fast URL Parsing

`tldts` is a JavaScript library to extract hostnames, domains, public suffixes, top-level domains and subdomains from URLs.

**Features**:

1. Tuned for **performance** (order of 0.1 to 1 μs per input)
2. Handles both URLs and hostnames
3. Full Unicode/IDNA support
4. Support parsing email addresses
5. Detect IPv4 and IPv6 addresses
6. Continuously updated version of the public suffix list
7. **TypeScript**, ships with `umd`, `esm`, `cjs` bundles and _type definitions_
8. Small bundles and small memory footprint
9. Battle tested: full test coverage and production use

⚠️ If you are migrating to `tldts` from another library like `psl`, make sure to check [the migration section](#migrating-from-other-libraries).

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

Modern _ES6 modules import_ is also supported:

```js
import { parse } from 'tldts';
```

Alternatively, you can try it _directly in your browser_ here: https://npm.runkit.com/tldts

Check [README.md](/packages/tldts/README.md) for more details about the API.

# Migrating from other libraries

TL;DR—here is a quick overview of how to use `tldts` to match the default behavior of the `psl` library. Skip to after the tables for a more detailed explanation.

| | Parsing a hostname |
| --- | --- |
| `tldts` | `tldts.parse('spark-public.s3.amazonaws.com', { allowPrivateDomains: true })` |
| `psl` | `psl.parse('spark-public.s3.amazonaws.com')` |
| Note | Make sure to include `{ allowPrivateDomains: true }` to consider private suffixes |

| | Parsing a URL |
| --- | --- |
| `tldts` | `tldts.parse('https://spark-public.s3.amazonaws.com/data', { allowPrivateDomains: true })` |
| `psl` | `psl.parse(new URL('https://spark-public.s3.amazonaws.com/data').hostname)` |
| Note | No need to extract hostnames from URLs, `tldts` can do that for you |

| | Getting the domain |
| --- | --- |
| `tldts` | `tldts.getDomain('spark-public.s3.amazonaws.com', { allowPrivateDomains: true })` |
| `psl` | `psl.get('spark-public.s3.amazonaws.com')` |
| Note | Using specific functions like `getDomain` are more efficient then relying on `parse` |

| | Getting the Public Suffix |
| --- | --- |
| `tldts` | `tldts.getPublicSuffix('spark-public.s3.amazonaws.com', { allowPrivateDomains: true })` |
| `psl` | `psl.parse('spark-public.s3.amazonaws.com').tld` |


*Explanation*. There are multiple libraries which can be used to parse URIs
based on the Public Suffix List. Not all these libraries offer the same
behavior by default and depending on your particular use-case, this can matter.
When migrating from another library to `tldts`, make sure to read this section
to preserve the same behavior.

The biggest difference between `tldts`'s default behavior and some other
libraries like `psl` has to do with which suffixes are considered by default.
The default for `tldts` is to **only consider the ICANN section** and ignore the
Private section.

Consider this example using the unmaintained `psl` library:
```js
const psl = require('psl');

psl.parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv')
// {
//   input: 'spark-public.s3.amazonaws.com',
//   tld: 's3.amazonaws.com', <<< Public Suffix is from Private section
//   sld: 'spark-public',
//   domain: 'spark-public.s3.amazonaws.com',
//   subdomain: null,
//   listed: true
// }
```

And now with `tldts`:
```js
const { parse } = require('tldts');

parse('spark-public.s3.amazonaws.com');
// {
//   domain: 'amazonaws.com',
//   domainWithoutSuffix: 'amazonaws',
//   hostname: 'spark-public.s3.amazonaws.com',
//   isIcann: true,
//   isIp: false,
//   isPrivate: false,
//   publicSuffix: 'com', <<< By default, use Public Suffix from ICANN section
//   subdomain: 'spark-public.s3'
// }
```

To get the **same behavior**, you need to pass the `{ allowPrivateDomains: true }` option:
```js
const { parse } = require('tldts');

parse('spark-public.s3.amazonaws.com', { allowPrivateDomains: true });
// {
//   domain: 'spark-public.s3.amazonaws.com',
//   domainWithoutSuffix: 'spark-public',
//   hostname: 'spark-public.s3.amazonaws.com',
//   isIcann: false,
//   isIp: false,
//   isPrivate: true,
//   publicSuffix: 's3.amazonaws.com', <<< Private Public Suffix is used
//   subdomain: ''
// }
```

Here are some other differences which can make your life easy. `tldts` **accepts
both hostnames and URLs as arguments**, so you do not need to parse your
inputs before handing them over to `tldts`:

```js
const { parse } = require('tldts');

// Both are fine!
parse('spark-public.s3.amazonaws.com', { allowPrivateDomains: true });
parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv', { allowPrivateDomains: true });
```

`tldts` offers dedicated methods to extract the Public Suffix, domain,
subdomain, etc. without having to rely on the more generic `parse` function.
This is also *more efficient* than calling `parse`, because less work as to be
done.

```js
const {
  getHostname,
  getDomain,
  getPublicSuffix,
  getSubdomain,
  getDomainWithoutSuffix,
} = require('tldts');

const url = 'https://spark-public.s3.amazonaws.com';

console.log(getHostname(url)); // spark-public.s3.amazonaws.com
console.log(getDomain(url, { allowPrivateDomains: true })); // spark-public.s3.amazonaws.com
console.log(getPublicSuffix(url, { allowPrivateDomains: true })); // s3.amazonaws.com
console.log(getSubdomain(url, { allowPrivateDomains: true })); // ''
console.log(getDomainWithoutSuffix(url, { allowPrivateDomains: true })); // spark-public
```

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
