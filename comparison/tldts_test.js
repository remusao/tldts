const { getDomain, getPublicSuffix, getSubdomain } = require('../packages/tldts/dist/cjs/index.js');

module.exports = {
  getDomain,
  getSubdomain,
  getPublicSuffix,
  mem: () => {
    console.log(process.memoryUsage().heapUsed);
    global.gc();
    console.log(process.memoryUsage().heapUsed);
  },
};

if (process.argv[process.argv.length - 1] === 'mem') {
  module.exports.mem();
}
