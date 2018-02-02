#!/usr/bin/env node

'use strict';

var tld = require('../index.js');
var Benchmark = require('benchmark');


var HOSTNAMES = [
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


var URLS = [
  // IDN labels
  'example.北海道.jp', // 北海道.jp
  'example.和歌山.jp', // 和歌山.jp
  'foo.bar.baz.ايران.ir', // ايران.ir
  'foo.bar.baz.موبايلي', // موبايلي

  // Mixed case
  'ExAmPlE.北海道.JP', // 北海道.jp
  'example.Cust.Disrec.Thingdust.Io', // cust.disrec.thingdust.io
  'Example.Wa.Edu.Au', // wa.edu.au
  'FOO.bar.BAZ.ortsinfo.AT', // null

  // Full URLs
  '2001:0DB8:0100:F101:0210:A4FF:FEE3:9566',
  'http://user:pass@www.examplegoogle.com:21/blah#baz',
  'http://iris.test.ing/&#x1E0B;&#x0323;/?&#x1E0B;&#x0323;#&#x1E0B;&#x0323;',
  'http://0000000000000300.0xffffffffFFFFFFFF.3022415481470977',
  'http://192.168.0.1/',
  'http://%30%78%63%30%2e%30%32%35%30.01%2e',
  'http://user:pass@[::1]/segment/index.html?query#frag',
  'https://[::1]',
];


function bench(values) {
  console.log(
    'While interpreting the results, keep in mind that each "op" reported' +
    ' by the benchmark is processing ' + values.length + ' domains'
  );

  new Benchmark.Suite()
    .add('tldjs#isIp', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.isIp(values[i]);
      }
    })
    .add('tldjs#isValid', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.isValid(values[i]);
      }
    })
    .add('tldjs#extractHostname', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.extractHostname(values[i]);
      }
    })
    .add('tldjs#tldExists', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.tldExists(values[i]);
      }
    })
    .add('tldjs#getPublicSuffix', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.getPublicSuffix(values[i]);
      }
    })
    .add('tldjs#getDomain', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.getDomain(values[i]);
      }
    })
    .add('tldjs#getSubdomain', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.getSubdomain(values[i]);
      }
    })
    .add('tldjs#parse', () => {
      for (var i = 0; i < values.length; i += 1) {
        tld.parse(values[i]);
      }
    })
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .run();
}


// TODO - Compare to other libraries
function main() {
  console.log('>>> -------------------- <<<');
  console.log('>>> Only valid hostnames <<<');
  console.log('>>> -------------------- <<<');
  bench(HOSTNAMES);

  console.log();
  console.log('>>> ----------- <<<');
  console.log('>>> Random URLs <<<');
  console.log('>>> ----------- <<<');
  bench(URLS);
}


main();
