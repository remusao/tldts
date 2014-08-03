"use strict";

var Rule = require('../rule.js');

module.exports = function standardJSONExport(xlds){
  var data = {};

  xlds.forEach(function(xld){
    var rule = new Rule(xld);

    if (!data[rule.firstLevel]){
      data[rule.firstLevel] = [];
    }

    if (rule.wildcard){
      data[rule.firstLevel].push('*' + (rule.secondLevel || ''));
    }

    if (rule.exception){
      data[rule.firstLevel].push('!' + (rule.secondLevel || ''));
    }

    if (!rule.exception && !rule.wildcard && rule.secondLevel){
      data[rule.firstLevel].push(rule.secondLevel);
    }
  });

  // Compressing data
  for (var tld in data){
    data[tld] = data[tld].join('|');
  }

  return ['rules.json', data];
};