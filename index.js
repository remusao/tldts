"use strict";

var tld = require('./lib/tld.js').init();
tld.rules = require('./src/rules.json');

module.exports = tld;