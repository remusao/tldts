"use strict";

/*jshint node:true strict: true */

var Rule = require(__dirname + '/../rule.js');

function legacyJSONExport(xlds){
  var data = [];

  xlds.forEach(function(xld){
    data.push( new Rule(xld) );
  });

  return ['rules-legacy.json', data];
}


module.exports = legacyJSONExport;