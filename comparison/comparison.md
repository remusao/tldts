# Comparison With Other Libraries

There are a few libraries out there allowing you to parse a hostname into
its top-level domain, etc. A common trait is that they all rely on the
[public suffix list](https://publicsuffix.org/list/) project which
maintains a list of all public suffixes.

Nonetheless, the features and performance characteristics of the
libraries available in the JavaScript ecosystem vary a lot. Some
libraries allow to parse URLs, som e require a hostname as input, etc.

This document aims at comparing the most popular libraries available along
several axes:
1. Features
2. Performance
3. Loading time
4. Memory used

Libraries (with approximate number of downloads per week from NPM):

  * psl: https://www.npmjs.com/package/psl (4.7M/w)
  * tld.js: https://www.npmjs.com/package/tldjs (174k/w)
  * parse-domain: https://www.npmjs.com/package/parse-domain (44k/w)
  * haraka-tld: https://www.npmjs.com/package/haraka-tld (271/w)
  * tldts: https://www.npmjs.com/package/tldts (240/w)
  * uBlock's publicsuffixlist.js: https://github.com/gorhill/uBlock/blob/master/src/lib/publicsuffixlist.js

**DISCLAIMER**:
* All measurements were performed using Node.js 11.6.0 (latest at the time of writing).
* Measurements were performed on a X1 Carbon 2016, i7 U6600 with 16GB of RAM.
* These are micro-benchmarks which might not reflect real use-cases although I
  tried to get as close as possible.

## Feature Matrix

| Library                 | IDNA support | URLs support | IP support | getDomain | getPublicSuffix | ICANN/Private | Ships lists |
|:----------------------- | ------------:| ------------:| ----------:| ---------:| ---------------:| -------------:| -----------:|
| **tldt**                |            X |            X |          X |         X |               X |             X |           X |
| tld.js                  |            X |            X |          X |         X |               X |             X |           X |
| psl                     |            X |              |            |         X |               X |               |           X |
| parse-domain            |            X |            X |            |         X |               X |             X |           X |
| haraka-tld              |            X |            X |            |         X |               X |               |           X |
| uBlock publicsuffixlist |            ? |              |            |         X |               X |               |             |

# Memory Usage

Here we try to estimate the memory used by each library. The
measurements are done using the `./comparison/bench_memory.js` script,
which will load each file ten times and measure the average memory usage
before and after GC using `process.memoryUsage()`. The result are then
compared to a reference memory usage computed in the same way using
`noop_test.js` which does not import anything.

| Library                | Before GC | After GC |
|:---------------------- | ---------:| --------:|
| **tldts-experimental** |  461KB    | 229 KB   |
| parse-domain           |  2.579 MB | 1.310MB  |
| psl                    |  2.199 MB | 1.537MB  |
| tldjs                  |  2.621 MB | 1.714MB  |
| tldts                  |  3.094 MB | 1.792MB  |
| ublock publicsuffix    |  4.529 MB*| 2.399MB  |
| haraka-tld             |  4.405 MB | 2.595MB  |

(*) The memory of uBlock cannot be estimated correctly as for this
benchmarks the lists were inlined in the source code, which is not how
it's used in production.

# Performance Matrix

Here we measure the performance of three common operations performed with a
domain parsing library: getting the public suffix of a hostname, getting the
domain (tld + sld) and getting the subdomain.

A few notes about this benchmark:
* The inputs used are always already valid hostnames (no URLs, although some
  libraries support it)
* The selection of hostnames can be seen in `./comparison/bench_performance.js`
  and was selected to contain a mix of non-existing suffixes, ICANN rules,
  private rules as well as wildcards and exceptions.
* All hostnames were ASCII (puny-encoded if needed before-hand)
* All libraries were used in their default setup (no option given, with the
  exception of `tldts-no-parse` which runs `tldts` disabling the parsing phase
  and assuming that the input is already a valid hostname).

The results are expressed in terms of operations per second (where each
operation is calling the function once on a hostname).

| Library                | getPublicSuffix | getDomain     | getSubdomain |
|:---------------------- | ---------------:| -------------:| ------------:|
| **tldts-experimental** |       1_898_446 | 1_690_572     |    1_615_166 |
| tldts no parsing       |       1_780_469 | 1_515_703     |    1_502_692 |
| **tldts**              |   **1_280_063** | **1_134_956** |    1_125_362 |
| tld.js                 |       1_141_414 | 1_049_180     |    1_125_362 |
| ublock publicsuffix    |         620_816 |   567_664     |            ? |
| parse-domain           |         554_355 |   528_217     |      551_008 |
| haraka-tld             |               ? |   105_321     |            ? |
| psl                    |           1_654 |     1_693     |        1_673 |

Here we see that the performance varies a lot between libraries, for the same
operations. `tldts` is almost **1000** faster than `psl`, which is the most
popular library.

# Loading Time

One point of comparison which can be important in some contexts is the loading
time of the bundle itself (or time it takes to parse the code and initialize
it). It can have a big impact if you use the library on very slow devices (like
mobiles) and here again, not all the libraries are equal.

The benchmark code can be found in `./comparison/bench_startup.sh`. It measures
the time it takes to import each of the libraries. The measurements are
performed using the [bench](https://hackage.haskell.org/package/bench) CLI,
looking at the `mean` time returned for each.

Note that this benchmark was performed using the cjs bundle. The
performance might be different in another environment or different
bundle (e.g.: UMD in a browser).

| Library                | Mean (ms) |
|:---------------------- | ---------:|
| Ref (no `require`)     |     48.21 |
| **tldts-experimental** | **47.93** |
| psl                    |     53.77 |
| tld.js                 |     58.74 |
| parse-domain           |     61.96 |
| tldts                  |     64.48 |
| ublock                 |     78.05 |
| haraka-tld             |     84.93 |

Note that some libraries like `ublock` or `haraka-tld` perform some form of parsing
of the rules at loading-time, which incurs an initial cost when importing the
library.

# Bundles Matrix

Comparison of bundle sizes, when applicable (not all libraries provide bundles):

| Library                | Normal    | Minified  | Gzipped |
|:---------------------- | ---------:| ---------:| -------:|
| **tldts-experimental** | **100KB** |  **94KB** |    38KB |
| tldts                  |  140KB    |  **95KB** |    37KB |
| psl                    |  138KB    |    122KB  |    39KB |
| tld.js                 |  209KB    |    141KB  |    40KB |
| parse-domain           |      ?    |        ?  |       ? |
| ublock                 |      ?    |        ?  |       ? |
| haraka-tld             |      ?    |        ?  |       ? |

# Dependencies Matrix

Here is a comparison of dependencies for each library:

| Library             | Dependencies             |
|:------------------- |:------------------------ |
| **tldts**           | (none)                   |
| psl                 | punycode                 |
| tld.js              | punycode                 |
| ublock              | punycode                 |
| haraka-tld          | punycode                 |
| parse-domain        | ?                        |
