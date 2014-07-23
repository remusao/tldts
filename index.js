"use strict";

var tld = require('./lib/tld.js').init();
tld.rules = require('./rules.json');

module.exports = tld;
