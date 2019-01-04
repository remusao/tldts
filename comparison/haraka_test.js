const tlds = require('haraka-tld');

module.exports = {
  getDomain(url) {
    return tlds.get_organizational_domain(url);
  },
  mem: () => {
    console.log(process.memoryUsage().heapUsed);
    global.gc();
    console.log(process.memoryUsage().heapUsed);
  },
};

if (process.argv[process.argv.length - 1] === 'mem') {
  module.exports.mem();
}
