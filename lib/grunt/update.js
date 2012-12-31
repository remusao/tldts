"use strict";

/*jshint node:true strict: true */

var request = require('request');
var parser = require(__dirname + '/../parsers/publicsuffix-org.js');

module.exports = function(grunt){
  var _ = grunt.utils._;

  /**
   *
   * @param {string} key
   * @return {object}
   */
  function computeConfiguration(key){
    var config = grunt.config.get(key || 'update') || {};
    var defaultConfig = require(__dirname + '/defaults.json');

    return _.extend(defaultConfig, config);
  }

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

  /**
   * @param {string|undefined} provider
   */
  return function tldUpdate(provider){
    var done, config;

    done = this.async();
    config = computeConfiguration(this.name);
    provider = computeProvider(provider, config);

    request.get(config.providers[provider], function (err, response, body) {
      var queue, tlds;

      if (err) {
        throw new Error(err);
      }

      tlds = parser.parse(body);
      queue = grunt.utils.async.queue(function(exportTask, callback){
        var task_result = exportTask(tlds);
        var filename = task_result[0];
        var data = task_result[1];

        data = JSON.stringify(data);

        grunt.file.write(__dirname + '/../../src/'+filename, data);

        callback();
      }, 5);

      queue.drain = done;
      queue.push(require(__dirname + '/../exports/index.js'));
    });
  };
};