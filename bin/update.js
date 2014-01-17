#!/usr/bin/env node

"use strict";

var pathJoin = require('path').join;

var defaultConfig = require(pathJoin(__dirname, '/defaults.json'));
var updater = require(pathJoin(__dirname, '/../lib/updater/rules.js'))(defaultConfig);

updater.run();