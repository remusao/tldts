"use strict";

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: ['grunt.js', 'lib/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', 'jshint');

  // Custom Task to build files
  grunt.registerTask('update',
    'Update ruleset from publicsuffix.org dataset.',
    require(__dirname + '/lib/grunt/update.js')(grunt)
  );
};
