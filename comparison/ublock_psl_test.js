const suffixList = require('./publicsuffixlist.js/publicsuffixlist');
// For utf-8 conversion - npm install punycode
const punycode = require('punycode');
const fs = require('fs');

// Suffix list downloaded from https://publicsuffix.org/list/public_suffix_list.dat.dat
const suffixData = fs.readFileSync('./public_suffix_list.dat', 'utf8');

suffixList.parse(suffixData, punycode.toASCII);

module.exports = {
  getDomain: suffixList.getDomain,
  getPublicSuffix: suffixList.getPublicSuffix,
  mem: () => {
    console.log(process.memoryUsage().heapUsed);
    global.gc();
    console.log(process.memoryUsage().heapUsed);
  },
};

if (process.argv[process.argv.length - 1] === 'mem') {
  module.exports.mem();
}
