#!/usr/bin/env node

var updater = require('./update.js');
var SHOULD_UPDATE = process.env.npm_config_tldjs_update_rules === 'true';


if (SHOULD_UPDATE) {
  console.log('tldjs: updating rules from %s.', updater.providerUrl);

  updater.run(function(err){
    if (err) {
      console.error(err.message);
      process.exit(err.code);
    }

    console.log('tldjs: rules list updated.');
    process.exit(0);
  });
}
