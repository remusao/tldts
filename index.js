"use strict";

var tld = require('./lib/tld.js').init();
tld.rules = require('./dist/rules.json');

module.exports = tld;