
const psl = require('psl');

module.exports = {
  getDomain(domain) { return psl.get(domain); },
  getPublicSuffix(domain) { return psl.parse(domain).tld; },
  getSubdomain(domain) { return psl.parse(domain).subdomain; },
  mem: () => {
    console.log(process.memoryUsage().heapUsed);
    global.gc();
    console.log(process.memoryUsage().heapUsed);
  },
};

if (process.argv[process.argv.length - 1] === 'mem') {
  module.exports.mem();
}
