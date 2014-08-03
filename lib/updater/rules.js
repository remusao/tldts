"use strict";

var request = require('request');
var async = require('async');
var join = require('path').join;
var fs = require('fs');
var parser = require('../parsers/publicsuffix-org.js');

module.exports = {
  run: function runUpdater(providerUrl){
    console.log('Requesting tld data from '+ providerUrl +'…');

    request.get(providerUrl, function (err, response, body) {
      var queue, tlds;

      if (err) {
        throw new Error(err);
      }

      tlds = parser.parse(body);
      queue = async.queue(function(exportTask, callback){
        console.log('Processing '+ exportTask.name +'…');

        var task_result = exportTask(tlds);
        var filename = task_result[0];
        var data = task_result[1];

        data = JSON.stringify(data);

        fs.writeFile(join(__dirname, '..', '..', filename), data, 'utf-8', callback);
      }, 5);

      queue.drain = function(){
        console.log('Update complete.');
      };

      queue.push(require(join(__dirname, '..', 'exports', 'index.js')));
    });
  }
};
