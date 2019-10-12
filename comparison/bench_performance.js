const Benchmark = require('benchmark');

const tldtsExperimentalNoParse = require('./tldts-experimental-no-parse_test.js');
const tldtsExperimental = require('./tldts-experimental_test.js');
const tldtsNoParse = require('./tldts-no-parse_test.js');
const tldts = require('./tldts_test.js');
const ublock = require('./ublock_psl_test.js');
const haraka = require('./haraka_test.js');
const parseDomain = require('./parse-domain_test.js');
const psl = require('./psl_test.js');
const tldjs = require('./tldjs_test.js');

const HOSTNAMES = [
  // No public suffix
  'example.foo.edu.au', // null
  'example.foo.edu.sh', // null
  'example.disrec.thingdust.io', // null
  'foo.bar.baz.ortsinfo.at', // null

  // ICANN
  'example.foo.nom.br', // *.nom.br
  'example.wa.edu.au', // wa.edu.au
  'example.com', // com
  'example.co.uk', // co.uk

  // Private
  'foo.bar.baz.stolos.io', // *.stolos.io
  'foo.art.pl', // art.pl
  'foo.privatizehealthinsurance.net', // privatizehealthinsurance.net
  'example.cust.disrec.thingdust.io', // cust.disrec.thingdust.io

  // Exception
  'foo.city.kitakyushu.jp', // !city.kitakyushu.jp
  'example.www.ck', // !www.ck
  'foo.bar.baz.city.yokohama.jp', // !city.yokohama.jp
  'example.city.kobe.jp', // !city.kobe.jp
];

function printOps(n) {
 return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_');
}

function printResult(event) {
  console.log(`${event.target.name} => ${printOps(Math.floor(event.target.hz * HOSTNAMES.length))} ops/second`);
}

console.log();
console.log('>> getPublicSuffix');
(new Benchmark.Suite())
  .add('tldts-experimental no parsing#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsExperimentalNoParse.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .add('tldts no parsing#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsNoParse.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .add('tldts-experimental#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsExperimental.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .add('tldts#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldts.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .add('tld.js#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldjs.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .add('ublock#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      ublock.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .add('parse-domain#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      parseDomain.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .add('psl#getPublicSuffix', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      psl.getPublicSuffix(HOSTNAMES[i]);
    }
  })
  .on('cycle', printResult)
  .run({ async: false });


console.log();
console.log('>> getDomain');
(new Benchmark.Suite())
  .add('tldts-experimental no parsing#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsExperimentalNoParse.getDomain(HOSTNAMES[i]);
    }
  })
  .add('tldts no parsing#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsNoParse.getDomain(HOSTNAMES[i]);
    }
  })
  .add('tldts-experimental#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsExperimental.getDomain(HOSTNAMES[i]);
    }
  })
  .add('tldts#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldts.getDomain(HOSTNAMES[i]);
    }
  })
  .add('tld.js#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldjs.getDomain(HOSTNAMES[i]);
    }
  })
  .add('ublock#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      ublock.getDomain(HOSTNAMES[i]);
    }
  })
  .add('parse-domain#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      parseDomain.getDomain(HOSTNAMES[i]);
    }
  })
  .add('haraka#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      haraka.getDomain(HOSTNAMES[i]);
    }
  })
  .add('psl#getDomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      psl.getDomain(HOSTNAMES[i]);
    }
  })
  .on('cycle', printResult)
  .run({ async: false });


console.log();
console.log('>> getSubdomain');
(new Benchmark.Suite())
  .add('tldts-experimental no parsing#getSubdomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsExperimentalNoParse.getSubdomain(HOSTNAMES[i]);
    }
  })
  .add('tldts no parsing#getSubdomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsNoParse.getSubdomain(HOSTNAMES[i]);
    }
  })
  .add('tldts-experimental#getSubdomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldtsExperimental.getSubdomain(HOSTNAMES[i]);
    }
  })
  .add('tldts#getSubdomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldts.getSubdomain(HOSTNAMES[i]);
    }
  })
  .add('tld.js#getSubdomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      tldjs.getSubdomain(HOSTNAMES[i]);
    }
  })
  .add('parse-domain#getSubdomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      parseDomain.getSubdomain(HOSTNAMES[i]);
    }
  })
  .add('psl#getSubdomain', () => {
    for (let i = 0; i < HOSTNAMES.length; i += 1) {
      psl.getSubdomain(HOSTNAMES[i]);
    }
  })
  .on('cycle', printResult)
  .run({ async: false });
