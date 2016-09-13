#!/usr/bin/env node

'use strict';

var pathJoin = require('path').join;
var updater = require(pathJoin(__dirname, '..', 'lib', 'updater'));

module.exports = updater;

if (process.mainModule === module) {
  console.log('Requesting tld data...');

  updater.run(function(){
    console.log('Update complete.');
  });
}
