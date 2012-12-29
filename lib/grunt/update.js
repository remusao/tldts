"use strict";

/*jshint node:true strict: true */

var request = require('request');
var parser = require(__dirname + '/../parsers/publicsuffix-org.js');
var Rule = require(__dirname + '/../rule.js');

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
   *
   * @param {Array} tlds
   */
  function exportAsJSON(tlds){
    var data = JSON.stringify(tlds);

    grunt.file.write(__dirname + '/../../src/rules.json', data);
  }

  function exportAsRegexp(tlds){
    var data = {};

    tlds.forEach(function(tld){
      var rule = new Rule(tld);

      if (Array.isArray(data[rule.firstLevel]) === false){
        data[rule.firstLevel] = {
          wildcard: false,
          rules: []
        };
      }

      if (rule.wildcard){
        data[rule.firstLevel].wildcard = true;
        data[rule.firstLevel].rules.push('[^\\.]+\\.[^\\.]+'+(rule.secondLevel ? '\\.'+rule.secondLevel : ''));
      }

      if (rule.exception){
        data[rule.firstLevel].rules.push('!'+rule.secondLevel);
      }

      if (!rule.exception && !rule.wildcard && rule.secondLevel){
        data[rule.firstLevel].rules.push(rule.secondLevel);
      }
    });

    for (var tld in data){
      var tld_data = data[tld];

      if (tld_data.wildcard === false){
        tld_data.rules.unshift('[^\\.]+');
      }

      data[tld] = '(('+ tld_data.rules.join('|') + ')\\.'+tld+')$';
    }

    data = JSON.stringify(data, null, "\t");

    grunt.file.write(__dirname + '/../../src/rules-regexp.json', data);
  }

  /**
   * @param {string|undefined} provider
   */
  return function tldUpdate(provider){
    var done = this.async();
    var config = computeConfiguration(this.name);
    provider = computeProvider(provider, config);

    request.get(config.providers[provider], function (err, response, body) {
      if (err) {
        throw new Error(err);
      }

      var tlds = parser.parse(body);

      grunt.utils.async.parallel([
        function (callback){
          exportAsJSON(tlds);

          callback();
        },
        function (callback){
          exportAsRegexp(tlds);

          callback();
        }
      ], done);
    });
  };
};