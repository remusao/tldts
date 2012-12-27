"use strict";

/*global module:false*/
/*jshint node:true strict: true */

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    lint:   {
      files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    watch:  {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    jshint: {
      options: {
        curly:   true,
        eqeqeq:  true,
        immed:   true,
        latedef: true,
        newcap:  true,
        noarg:   true,
        sub:     true,
        undef:   true,
        boss:    true,
        eqnull:  true
      },
      globals: {

      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint');

  // Custom Task to build files
  grunt.registerTask('update',
    'Update ruleset from publicsuffix.org dataset.',
    require(__dirname + '/lib/grunt/update.js')(grunt)
  );
};
