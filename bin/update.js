#!/usr/bin/env node

'use strict';

var pathJoin = require('path').join;
var updater = require(pathJoin(__dirname, '..', 'lib', 'updater'));

console.log('Requesting tld data...');

updater.run(function(){
  console.log('Update complete.');
});
