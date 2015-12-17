logger = require './config/logger'

module.exports = (grunt) ->

    # task configuration
    # initializing task configuration
    grunt.initConfig

        # meta data
        pkg: grunt.file.readJSON("package.json")

        files:
            sass: []
            js: 
                tests: 'test/spec/**/*.js'                
                main: 
                    dest: 'client/public/dist/js/main.js'
                    min: 'client/public/dist/js/main.min.js'
                    src: [                
                        'client/app//**/*settings.js'
                        'client/app/**/*.module.js'
                        'client/app/**/*.intr.js'
                        'client/app/**/*.svc.js'
                        'client/app/**/*.ctrl.js'
                        'client/app/**/*.filter.js'
                    ]
                vendor:
                    dest: 'client/public/dist/js/vendor.js'
                    min: 'client/public/dist/js/vendor.min.js'
                    src: [
                        'client/public/vendor/jquery/dist/jquery.min.js'
                        'client/public/vendor/tether/dist/js/tether.min.js'
                        'client/public/vendor/underscore/underscore-min.js'
                        'client/public/vendor/marked/marked.min.js'
                        'client/public/vendor/bootstrap/dist/js/bootstrap.min.js'        
                        'client/public/vendor/hello/dist/hello.min.js'    
                        'client/public/vendor/async/dist/async.min.js'
                        'client/public/vendor/angular/angular.min.js'
                        'client/public/vendor/angular-marked/dist/angular-marked.min.js'
                        'client/public/vendor/angular-sanitize/angular-sanitize.min.js'
                        'client/public/vendor/angular-route/angular-route.min.js'
                        'client/public/vendor/angular-toastr/dist/angular-toastr.tpls.min.js'
                        'client/public/vendor/angular-local-storage/dist/angular-local-storage.min.js'
                    ]


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

        concat:
            lib:
                options:
                    stripBanners: true
                files:
                    '<%= files.js.vendor.min %>':'<%= files.js.vendor.src %>'
            src:
                options:
                    separator: ';'
                    sourceMap: true
                files:
                    '<%= files.js.main.dest %>':'<%= files.js.main.src %>'

        uglify:
            src:
                options:
                    compress: true
                    mangle: true
                    sourceMap: true
                    sourceMapIncludeSources: true
                    sourceMapIn: '<%= files.js.main.dest %>.map',
                files:
                    '<%= files.js.main.min %>':'<%= files.js.main.dest %>'

        ngconstant:
            options:
                name: 'config'
            env:
                options:
                    dest: 'client/app/config/env.settings.js'
                constants: grunt.file.readJSON 'client/app/config/settings.json'

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

        concurrent:
            task: ['nodemon', 'watch']
            options:
                logConcurrentOutput: true

        nodemon:
            dev:
                script: 'server.js'                
                options:
                    ignore: ['node_modules/**', 'client/**', 'test/**']

        watch:
            sass:
                files: 'client/public/stylesheets/sass/**/*.scss'
                tasks: ['sass']
            client_settings:
                files: 'client/app/config/**/*.json'
                tasks: ['ngconstant:env']
            client_resources:
                files: 'client/app/**/*.js'
                tasks: ['concat', 'uglify']
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
    grunt.registerTask 'default', ['sass', 'ngconstant:env', 'concat', 'uglify', 'concurrent']
    grunt.registerTask 'test', ['mochaTest', 'watch:tests']
    grunt.registerTask 'build', ['sass', 'ngconstant:env', 'concat', 'uglify']