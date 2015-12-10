logger = require './config/logger'

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
        sass:
            dist:
                files: [
                    expand: true
                    cwd: 'client/public/stylesheets/sass'
                    src: ['*.scss']
                    dest: 'client/public/stylesheets/css'
                    ext: '.css'
                ]
                options:
                    quiet: true,
                    loadPath: [
                        'client/public/vendor/bourbon/app/assets/stylesheets',
                        'client/public/vendor/neat/app/assets/stylesheets',
                        'client/public/vendor/bitters/app/assets/stylesheets'
                    ]

        mochaTest: 
            test:
                options:
                    reporter: 'spec'
                    clearRequireCache: true
                    require: [
                        () -> process.env.NODE_ENV = 'test' # swap our settings to run with test configurations
                        () -> global.__base = __dirname + '/'                        
                    ]
                src: ['test/**/*.js']

        ngconstant:
            options:
                name: 'config'
            env:
                options:
                    dest: 'client/app/config/env.settings.js'
                constants: grunt.file.readJSON 'client/app/config/settings.json'

        concurrent:
            task: ['nodemon', 'watch']
            options:
                logConcurrentOutput: true

        nodemon:
            dev:
                scripts: 'server.js'                

        watch:
            sass:
                files: 'client/public/stylesheets/sass/**/*.scss'
                tasks: ['sass']
            client_settings:
                files: 'client/app/config/**/*.json'
                tasks: ['ngconstant:env']
            tests:
                options:
                    spawn: false
                files: 'test/**/*.js',
                tasks: 'mochaTest'


    # load external tasks
    # load all plugins that match 'grunt-*'
    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks)

    # hooks for watch when running tests
    testSrc = grunt.config 'mochaTest.test.src'
    grunt.event.on 'watch', (action, filepath) ->
        filepath = filepath.replace /\\/g,"/"
        
        grunt.config 'mochaTest.test.src', testSrc
        grunt.config 'mochaTest.test.src', filepath if filepath.match 'test/'        

    # create workflows
    grunt.registerTask 'default', ['sass', 'ngconstant:env', 'concurrent']
    grunt.registerTask 'test', ['mochaTest', 'watch:tests']
    grunt.registerTask 'build:production', ['sass', 'ngconstant:env']