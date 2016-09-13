"use strict";

var join = require('path').join;
var http = require('https');
var fs = require('fs');

var pkg = require('../package.json');

var providerUrl = pkg.tldjs.providers['publicsuffix-org'];
var parser = require('./parsers/publicsuffix-org.js');
var exportTask = require('./exports/standard-json.js');

module.exports = {
  providerUrl: providerUrl,
  run: function runUpdater(done){
    done = typeof done === 'function' ? done : function(){};

    var req = http.request(providerUrl, function (res) {
      var body = '';

      if (res.statusCode !== 200) {
        res.destroy();
        return done(new Error('tldjs: remote server responded with HTTP status ' + res.statusCode));
      }

      res.setEncoding('utf8');

      res.on('data', function(d) {
        body += d;
      });

      res.on('end', function() {
        var tlds = parser.parse(body);
        var task_result = exportTask(tlds);
        var filename = task_result[0];
        var data = task_result[1];

        data = JSON.stringify(data);

        fs.writeFile(join(__dirname, '..', filename), data, 'utf-8', done);
      });
    });

    req.setTimeout(5000);
    req.on('error', done);
    req.end();
  }
};
