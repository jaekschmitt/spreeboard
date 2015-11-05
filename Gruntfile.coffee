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

        watch:
            sass:
                files: 'client/public/stylesheets/sass/**/*.scss'
                tasks: ['sass']                


    # load external tasks
    # load all plugins that match 'grunt-*'
    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks)

    # create workflows
    grunt.registerTask 'default', ['sass', 'watch']