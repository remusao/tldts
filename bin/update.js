#!/usr/bin/env node

"use strict";

var pathJoin = require('path').join;

var updater = require(pathJoin(__dirname, '..', 'lib', 'updater', 'rules.js'));

updater.run(process.env.npm_package_tldjs_providers_publicsuffix);