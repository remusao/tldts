#!/usr/bin/env node

'use strict';

const { parse } = require('..');

console.log(
  JSON.stringify(parse(process.argv[process.argv.length - 1]), null, 2),
);
