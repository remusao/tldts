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

# Special-use domains (RFC 6761 / IANA)

Reserved special-use names such as `localhost`, `*.test`, `*.invalid`, `example(.com/.net/.org)`, `*.local`, `*.onion`, `*.alt`, and `home.arpa` aren't identified by `isIcann`/`isPrivate`: most aren't in the Public Suffix List, and the few that are (e.g. `onion`, `home.arpa`) appear there as ordinary ICANN suffixes. Enable detection with `{ detectSpecialUse: true }` to populate the `isSpecialUse` result field; it is `null` otherwise, so the default path does no extra work:

```js
const { parse } = require('tldts');

parse('http://printer.local/', { detectSpecialUse: true });
// { ...
//   isSpecialUse: true,
//   publicSuffix: 'local',
//   subdomain: '' }
```

The list tracks the IANA [Special-Use Domain Names](https://www.iana.org/assignments/special-use-domain-names/) registry (RFC 6761 and the later RFCs that extend it).

# Migrating from other libraries

TL;DR—here is a quick overview of how to use `tldts` to match the default behavior of the `psl` library. Skip to after the tables for a more detailed explanation.

|         | Parsing a hostname                                                                |
| ------- | --------------------------------------------------------------------------------- |
| `tldts` | `tldts.parse('spark-public.s3.amazonaws.com', { allowPrivateDomains: true })`     |
| `psl`   | `psl.parse('spark-public.s3.amazonaws.com')`                                      |
| Note    | Make sure to include `{ allowPrivateDomains: true }` to consider private suffixes |

|         | Parsing a URL                                                                              |
| ------- | ------------------------------------------------------------------------------------------ |
| `tldts` | `tldts.parse('https://spark-public.s3.amazonaws.com/data', { allowPrivateDomains: true })` |
| `psl`   | `psl.parse(new URL('https://spark-public.s3.amazonaws.com/data').hostname)`                |
| Note    | No need to extract hostnames from URLs, `tldts` can do that for you                        |

|         | Getting the domain                                                                   |
| ------- | ------------------------------------------------------------------------------------ |
| `tldts` | `tldts.getDomain('spark-public.s3.amazonaws.com', { allowPrivateDomains: true })`    |
| `psl`   | `psl.get('spark-public.s3.amazonaws.com')`                                           |
| Note    | Using specific functions like `getDomain` are more efficient then relying on `parse` |

|         | Getting the Public Suffix                                                               |
| ------- | --------------------------------------------------------------------------------------- |
| `tldts` | `tldts.getPublicSuffix('spark-public.s3.amazonaws.com', { allowPrivateDomains: true })` |
| `psl`   | `psl.parse('spark-public.s3.amazonaws.com').tld`                                        |

_Explanation_. There are multiple libraries which can be used to parse URIs
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

psl.parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv');
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
parse('https://spark-public.s3.amazonaws.com/dataanalysis/loansData.csv', {
  allowPrivateDomains: true,
});
```

`tldts` offers dedicated methods to extract the Public Suffix, domain,
subdomain, etc. without having to rely on the more generic `parse` function.
This is also _more efficient_ than calling `parse`, because less work as to be
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

# Limitations and security considerations

The core of `tldts` is turning a **hostname** into its public suffix, domain and subdomain: an exact lookup against the [Public Suffix List][public suffix list]. As a convenience it also takes a full **URL** and extracts the hostname for you, and that step is fast: `tldts.getHostname(url)` runs at ≈110 ns/call versus ≈290 ns for `new URL(url).hostname` (**~2.6× faster** on Node 26), and returns byte-identical hostnames for 100% of a 12k real-world-URL sample. That extraction is pragmatic, not a 100%-compliant [WHATWG URL](https://url.spec.whatwg.org/) parser, and differs mainly around **normalization**:

- **No host normalization**: the host is returned as it appears (ASCII-lower-cased only) — no IDNA/punycode conversion, IPv4 is not canonicalized, and IPv6 is returned without its surrounding brackets (and not zero-compressed).
- **Lenient parsing**: bare `host:port`, `user@host`, unbracketed IPv6 literals (which `new URL` rejects), out-of-range ports and trailing dots are accepted/handled rather than rejected.
- **`isIp` is a heuristic** ("probably an IP"), not a validator: it does not check IPv4 octet ranges and does not recognize IPv4-mapped IPv6.

If you rely on `tldts` for a **security decision** (origin checks, SSRF allow/deny lists, cookie scoping, …), do not treat its output as equivalent to a compliant URL parser. The safest pattern is to **extract the hostname with a real URL parser** — [`new URL(...)`](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL), available in Node.js and browsers — and then hand that hostname to `tldts` with host extraction turned **off** (`extractHostname: false`). That way the platform parser decides where the host begins and ends, and `tldts` is used only for the public-suffix/domain split, so the two can never disagree:

```js
const { getDomain } = require('tldts');

// 1. Let the platform URL parser determine the hostname (it throws on
//    invalid input and follows the WHATWG URL spec).
const { hostname } = new URL(untrustedUrl);

// 2. Ask tldts only for the public-suffix/domain split, skipping its own
//    hostname extraction.
const domain = getDomain(hostname, { extractHostname: false });
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
