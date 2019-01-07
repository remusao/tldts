/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

const { spawn } = require('child_process');

const files = [
  'tldts-experimental_test.js',
  'parse-domain_test.js',
  'tldts_test.js',
  'psl_test.js',
  'tldjs_test.js',
  'ublock_psl_test.js',
  'haraka_test.js',
];

function getMemoryUsage(file) {
  const memoryMeasurements = [];
  return new Promise((resolve, reject) => {
    const psl = spawn('node', [
      '--expose-gc',
      '--max-old-space-size=1000',
      '--max-semi-space-size=512',
      '--noconcurrent_sweeping',
      file,
      'mem',
    ]);

    psl.stdout.on('data', (data) => {
      memoryMeasurements.push(`${data}`.trim());
    });

    psl.stderr.on('data', (error) => {
      reject(error);
    });

    psl.on('close', () => {
      resolve([
        parseInt(memoryMeasurements[memoryMeasurements.length - 2], 10),
        parseInt(memoryMeasurements[memoryMeasurements.length - 1], 10),
      ]);
    });
  });
}

async function bench(file) {
  const n = 10;
  let totalBeforeGC = 0;
  let totalAfterGC = 0;
  for (let i = 0; i < n; i += 1) {
    const [beforeGC, afterGC] = await getMemoryUsage(file);
    totalBeforeGC += beforeGC;
    totalAfterGC += afterGC;
  }

  return [Math.floor(totalBeforeGC / n), Math.floor(totalAfterGC / n)];
}

async function main() {
  const [refBeforeGC, refAfterGC] = await bench('./noop_test.js');
  console.log('Reference memory', refBeforeGC, refAfterGC);

  for (const file of files) {
    const [beforeGC, afterGC] = await bench(file);
    console.log(`* ${file.slice(0, -8)}`);
    console.log(`  - ${beforeGC - refBeforeGC}`);
    console.log(`  - ${afterGC - refAfterGC}`);
  }
}

main();
