const parseDomain = require('parse-domain');

module.exports = {
  getDomain(url) {
    const { domain, tld } = parseDomain(url);
    return `${domain}.${tld}`;
  },
  getPublicSuffix(domain) { return parseDomain(domain).tld; },
  getSubdomain(domain) { return parseDomain(domain).subdomain; },
  mem: () => {
    console.log(process.memoryUsage().heapUsed);
    global.gc();
    console.log(process.memoryUsage().heapUsed);
  },
};

if (process.argv[process.argv.length - 1] === 'mem') {
  module.exports.mem();
}
