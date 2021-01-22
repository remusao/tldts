const {
  getDomain,
  getPublicSuffix,
  getSubdomain,
} = require('../packages/tldts-experimental/dist/cjs/index.js');

module.exports = {
  getDomain: (hostname) => getDomain(hostname, { extractHostname: false }),
  getSubdomain: (hostname) =>
    getSubdomain(hostname, { extractHostname: false }),
  getPublicSuffix: (hostname) =>
    getPublicSuffix(hostname, { extractHostname: false }),
  mem: () => {
    console.log(process.memoryUsage().heapUsed);
    global.gc();
    console.log(process.memoryUsage().heapUsed);
  },
};

if (process.argv[process.argv.length - 1] === 'mem') {
  module.exports.mem();
}
