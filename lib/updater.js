"use strict";

var join = require('path').join;
var request = require('request');
var async = require('async');
var fs = require('fs');

var pkg = require('../package.json');

var providerUrl = pkg.tldjs.providers['publicsuffix-org'];
var parser = require('./parsers/publicsuffix-org.js');

module.exports = {
  run: function runUpdater(done){
    done = typeof done === 'function' ? done : function(){};

    request.get(providerUrl, function (err, response, body) {
      var queue, tlds;

      if (err) {
        throw new Error(err);
      }

      tlds = parser.parse(body);
      queue = async.queue(function(exportTask, callback){
        var task_result = exportTask(tlds);
        var filename = task_result[0];
        var data = task_result[1];

        data = JSON.stringify(data);

        fs.writeFile(join(__dirname, '..', filename), data, 'utf-8', callback);
      }, 5);

      queue.drain = done;

      queue.push(require(join(__dirname, 'exports', 'index.js')));
    });
  }
};
