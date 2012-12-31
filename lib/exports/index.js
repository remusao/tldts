"use strict";

/*jshint node:true strict: true */

/*
 * Default list of exporters
 */
var exporters = [
  require(__dirname + '/standard-json.js'),
  require(__dirname + '/legacy-json.js')
];

module.exports = exporters;