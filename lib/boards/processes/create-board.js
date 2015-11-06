var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board');

var Application = function(args) {
    var app = {
        name: args.name,
        projectId: args.projectId,
        stages: args.stages,
        user: args.user
    };

    this.create = function(next) {
        logger.debug('Creating new board with: ');
        logger.debug(JSON.stringify(app, null, 4));

        async.series([
            loadProject,
            createBoard
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            logger.debug('Finished creating board with 0 errors.');
            return next(null, app);
        });
    };

    // private functions

    function loadProject(next) {
        glUtils.load('projects', {
            id: app.projectId,
            userId: app.user._id            
        }, function(err, project) {
            if(err) return next(err);

            app.project = project;
            next(null, app);
        });
    }

    function createBoard(next) {
        var board = new Board(app);
        board.save(function(err) {
            if(err) return next(err);

            app.board = board;
            next(null, app);
        });
    }

};

module.exports = Application;