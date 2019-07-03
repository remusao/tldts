# `tldts-experimental`

> faster, experimental, unstable version of `tldts`. It exposes the exact same
> API and is subjected to the same tests as the main library, but offers a
> different trade-off in terms of space, speed and accuracy.

See README.md from `tldts` for more details about the API.

## Differences with tldts

The default `tldts` package is what you should use most of the time and what is
imported out of the box. It makes use of an optimized DAWG (direct acyclic word
graph) data-structure and delivers very good performances. If that is not
enough, you can try the `tldts-experimental` package which implements a
*probabilistic data-structure*. It is:

* Must smaller (in terms of bundle size and memory footprint)
* Loads instantly (no data loading or parsing required)
* Much faster (lookups are up to 1.5-2x faster)

The drawback is that there might be some *unlikely* false positive (think bloom filters).

For more details, check the documentation from the following files:
* [building](https://github.com/remusao/tldts/blob/master/bin/builders/hashes.ts)
* [lookups](./src/packed-hashes.ts)
