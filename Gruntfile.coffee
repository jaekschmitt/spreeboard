module.exports = (grunt) ->

    # task configuration
    # initializing task configuration
    grunt.initConfig

        # meta data
        pkg: grunt.file.readJSON("package.json")

        files:
            sass: []
            js: []


        # task configuration
        
    # load external tasks
    # load all plugins that match 'grunt-*'
    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks)

    # create workflows
    grunt.registerTask 'default', []