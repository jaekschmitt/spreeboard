var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label');

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
            createBoard,
            createLabel,
            syncLabel
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
        console.log(app.stages);

        var board = new Board(app);

        board.created_by = {
            name: app.user.name,
            email: app.user.email
        };

        board.save(function(err) {
            if(err) return next(err);

            app.board = board;
            next(null, app);
        });
    }

    function createLabel(next) {
        var label = new Label({
            name: app.board.labelName,
            board: app.board._id            
        });

        label.save(function(err) {
            app.label = label;
            return next(err, label)   
        });
    }

    function syncLabel(next) {
        glUtils.create('labels', app.user._id, {
            projectId: app.project.id,
            name: app.label.name,
            color: '#f35b5f'
        }, function(err) {
            if(err) return next(err);                    
            next(null, app);
        });
    }
};

module.exports = Application;