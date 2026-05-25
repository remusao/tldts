'use strict';

// Allocation + throughput harness for tldts.
//
// Reports BOTH:
//   - bytes/op  : heapUsed delta per call, median of T trials (needs --expose-gc)
//   - ops/sec   : throughput, median of T trials
//
// across input groups TARGETED so each optimization's effect is visible
// (a change that only helps `foo.sch.uk` won't show up on a generic corpus).
//
// Run: node --expose-gc --predictable bench/allocations.js
// Optional args: --lib=tldts|tldts-experimental  --method=parse,getDomain,...
//                --group=corpus,hostnames,trie,wildcard,ip,invalid

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const tldts = require('tldts');
const tldtsExperimental = require('tldts-experimental');

if (typeof global.gc !== 'function') {
  console.error(
    'FATAL: run with `node --expose-gc bench/allocations.js` (global.gc needed for bytes/op).',
  );
  process.exit(1);
}

// --------------------------------------------------------------------------
// Inputs
// --------------------------------------------------------------------------

function loadCorpus() {
  const file = path.resolve(__dirname, './requests.json');
  if (!fs.existsSync(file)) return [];
  const urls = new Set();
  const lines = fs.readFileSync(file, { encoding: 'utf-8' }).split(/[\n\r]+/g);
  // Sample the head — plenty for stable measurement, keeps startup fast.
  for (let i = 0; i < lines.length && urls.size < 3000; i += 1) {
    const line = lines[i];
    if (!line) continue;
    try {
      urls.add(JSON.parse(line).url);
    } catch {
      /* skip malformed */
    }
  }
  return Array.from(urls);
}

function hostnamesOf(urls) {
  const hosts = new Set();
  for (const url of urls) {
    try {
      const h = new URL(url).hostname;
      if (h) hosts.add(h);
    } catch {
      /* skip */
    }
  }
  return Array.from(hosts);
}

const corpus = loadCorpus();
const hostnames = hostnamesOf(corpus);

// Targeted groups — each isolates a code path.
const GROUPS = {
  // generic real-world URLs (mostly .com etc. -> fast path)
  corpus: corpus.length ? corpus : ['https://www.example.com/path?q=1'],
  // bare hostnames (mostly fast path)
  hostnames: hostnames.length ? hostnames : ['www.example.com'],
  // multi-label suffixes that MISS the fast path -> exercise the trie walk
  trie: [
    'a.b.co.uk',
    'shop.example.co.uk',
    'foo.bar.ide.kyoto.jp',
    'x.example.com.br',
    'sub.example.gov.au',
    'deep.host.act.edu.au',
  ],
  // wildcard rules (*.sch.uk etc.) -> exercise wildcard branch + experimental fallback
  wildcard: [
    'foo.sch.uk',
    'pupils.school.sch.uk',
    'a.b.platform.sh',
    'project.pages.dev',
  ],
  // wildcard suffix == whole hostname -> experimental packed-hash FALLBACK branch
  // (matchLabels === numberOfHashes); the case item 5 rewrites.
  wildcardFallback: [
    'foo.sch.uk',
    'abc.sch.uk',
    'test.sch.uk',
    'bar.ck',
    'qux.ck',
  ],
  // IP addresses
  ip: ['192.168.0.1', '8.8.8.8', '[2001:db8::1]', '[::1]', '255.255.255.255'],
  // invalid / weird inputs
  invalid: ['-bad-.com', 'data:text/plain,x', 'not a host', '..', 'a..b'],
};

// Option variants mirror bench/benchmark.js. `undefined` is the default-options
// path that item 1 (options singleton) targets.
const VARIANTS = [
  { label: 'default', opts: undefined },
  { label: 'novalidate', opts: { validateHostname: false } },
  {
    label: 'fast',
    opts: { validateHostname: false, detectIp: false, mixedInputs: false },
  },
];

const METHODS = [
  'parse',
  'getDomain',
  'getFullDomain',
  'getPublicSuffix',
  'getHostname',
  'getSubdomain',
  'getDomainWithoutSuffix',
];

// --------------------------------------------------------------------------
// Measurement
// --------------------------------------------------------------------------

let SINK = 0; // prevents dead-code elimination of results

function consume(r) {
  if (r === null || r === undefined) return;
  if (typeof r === 'string') SINK += r.length;
  else if (r.hostname) SINK += 1; // parse() result object
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// bytes allocated per call: gc, baseline heapUsed, run a SMALL window so no GC
// fires mid-measurement (else the heapUsed delta undercounts). ~1024 calls keeps
// total allocation well under the young-gen scavenge threshold; median of many
// trials absorbs the per-trial granularity noise.
function bytesPerOp(
  fn,
  inputs,
  opts,
  { warmups = 5, maxCalls = 1024, trials = 25 },
) {
  const n = inputs.length;
  const passes = Math.max(1, Math.round(maxCalls / n));
  const calls = passes * n;
  for (let w = 0; w < warmups; w += 1) {
    for (let i = 0; i < n; i += 1) consume(fn(inputs[i], opts));
  }
  const results = [];
  for (let t = 0; t < trials; t += 1) {
    global.gc();
    global.gc();
    const before = process.memoryUsage().heapUsed;
    for (let p = 0; p < passes; p += 1) {
      for (let i = 0; i < n; i += 1) consume(fn(inputs[i], opts));
    }
    const after = process.memoryUsage().heapUsed;
    results.push((after - before) / calls);
  }
  return median(results);
}

function opsPerSec(
  fn,
  inputs,
  opts,
  { warmups = 3, passes = 400, trials = 5 },
) {
  const n = inputs.length;
  for (let w = 0; w < warmups; w += 1) {
    for (let i = 0; i < n; i += 1) consume(fn(inputs[i], opts));
  }
  const results = [];
  for (let t = 0; t < trials; t += 1) {
    const start = process.hrtime.bigint();
    for (let p = 0; p < passes; p += 1) {
      for (let i = 0; i < n; i += 1) consume(fn(inputs[i], opts));
    }
    const ns = Number(process.hrtime.bigint() - start);
    results.push((passes * n * 1e9) / ns);
  }
  return median(results);
}

// --------------------------------------------------------------------------
// Driver
// --------------------------------------------------------------------------

function arg(name) {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3).split(',') : null;
}

function main() {
  const wantLibs = arg('lib') || ['tldts', 'tldts-experimental'];
  const wantMethods = arg('method') || METHODS;
  const wantGroups = arg('group') || Object.keys(GROUPS);
  const libs = { tldts, 'tldts-experimental': tldtsExperimental };

  console.log(
    `corpus=${corpus.length} hostnames=${hostnames.length}; bytes/op=median7, ops/sec=median5\n`,
  );

  for (const libName of wantLibs) {
    const lib = libs[libName];
    console.log(`### ${libName}`);
    for (const method of wantMethods) {
      const fn = lib[method];
      for (const variant of VARIANTS) {
        for (const groupName of wantGroups) {
          const inputs = GROUPS[groupName];
          const bpo = bytesPerOp(fn, inputs, variant.opts, {});
          const ops = opsPerSec(fn, inputs, variant.opts, {});
          console.log(
            `  ${method.padEnd(22)} ${variant.label.padEnd(10)} ${groupName.padEnd(10)} ` +
              `${bpo.toFixed(1).padStart(8)} B/op  ${(ops / 1e6).toFixed(2).padStart(7)} M ops/s`,
          );
        }
      }
    }
    console.log('');
  }

  if (SINK === -1) console.log('unreachable', SINK); // keep SINK live
}

main();
