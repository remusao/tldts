const Benchmark = require('benchmark');
const chalk = require('chalk');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const tldts = require('..');

function main() {
  const urls = Array.from(
    new Set(
      fs
        .readFileSync(path.resolve(__dirname, './requests.json'), {
          encoding: 'utf-8',
        })
        .split(/[\n\r]+/g)
        .map(JSON.parse)
        .map(({ url }) => url),
    ),
  );
  const hostnames = Array.from(new Set(urls.map(url => new URL(url).hostname)));

  function bench(name, args, fn) {
    const suite = new Benchmark.Suite();
    suite
      .add(name, () => fn(args))
      .on('cycle', event => {
        console.log(
          `  + ${name} ${Math.floor(event.target.hz * args.length)} ops/second`,
        );
      })
      .run({ async: false });
  }

  for (const method of [
    'parse',
    'getHostname',
    'getPublicSuffix',
    'getDomain',
    'getSubdomain',
  ]) {
    console.log(`= ${chalk.bold(method)}`);
    const fn = tldts[method];

    for (const options of [
      undefined, // defaults
      { validateHostname: false },
      { validateHostname: false, detectIp: false, mixedInputs: false },
    ]) {
      bench(
        `#${chalk.bold(method)}(url, ${chalk.underline(
          JSON.stringify(options),
        )})`,
        urls,
        urls => {
          for (let i = 0; i < urls.length; i += 1) {
            fn(urls[i], options);
          }
        },
      );
    }

    for (const options of [
      undefined, // defaults
      { validateHostname: false },
      { validateHostname: false, detectIp: false, extractHostname: false },
    ]) {
      bench(
        `#${chalk.bold(method)}(hostname, ${chalk.underline(
          JSON.stringify(options),
        )})`,
        hostnames,
        hostnames => {
          for (let i = 0; i < hostnames.length; i += 1) {
            fn(hostnames[i], options);
          }
        },
      );
    }
  }
}

main();
