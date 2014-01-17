"use strict";

var request = require('request');
var async = require('async');
var fs = require('fs');
var parser = require(__dirname + '/../parsers/publicsuffix-org.js');

module.exports = function(config){

  /**
   *
   * @param {string} provider
   * @param {object} config
   * @return {string}
   */
  function computeProvider(provider, config){
    var defaultProvider = config.default_provider;

    return provider && config.providers[provider] ? provider : defaultProvider;
  }

  return {
    run: function runUpdater(provider){
      var provider = computeProvider(provider, config);
      var url = config.providers[provider];

      console.log('Requesting update from ['+ url +'].');

      request.get(url, function (err, response, body) {
        var queue, tlds;

        if (err) {
          throw new Error(err);
        }

        tlds = parser.parse(body);
        queue = async.queue(function(exportTask, callback){
          console.log('- processing '+ exportTask.name +'…');

          var task_result = exportTask(tlds);
          var filename = task_result[0];
          var data = task_result[1];

          data = JSON.stringify(data);

          fs.writeFile('dist/'+filename, data, 'utf-8', callback);
        }, 5);

        queue.drain = function(){
          console.log('Update complete.')
        };

        queue.push(require(__dirname + '/../exports/index.js'));
      });
    }
  };
};