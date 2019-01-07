const { getDomain, getPublicSuffix, getSubdomain } = require('../dist/tldts.cjs.js');

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
