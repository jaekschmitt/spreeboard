var logger = require(__base + 'config/logger'),    
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Task = mongoose.model('Task'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {
        boardId: args.boardId,
        board: args.board
    };

    this.fetch = function(next) {        
        logger.debug('Fetching board: ' + app.boardId);        

        async.series([
            loadBoard,
            fetchTasks,
            sortTasks
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            logger.debug('Finished fetchging board with 0 errors.');            
            return next(null, app);
        });
    };

    // private functions

    function loadBoard(next) {
        if(app.board) return next(null, app);
        
        var options = {
            criteria: { _id : app.boardId },
            select: 'id name stages'
        };

        Board.load(options, function(err, board) {
            if(err) return next(err);
            if(!board) return next(err);

            delete app.boardId;
            app.board = board;
            
            next(null, app);
        });
    }

    function fetchTasks(next) {
        var options = {            
            criteria: {
                board: app.board._id,
                stage: { $exists: true }
            },
            select: 'id title description stage created_at'
        };

        Task.list(options, function(err, tasks) {
            if(err) return next(err);

            app.tasks = tasks;
            next(null, app);
        });
    }

    function sortTasks(next) {
        var stages = app.board.stages;

        stages.forEach(function(stage) {                        
            var tasks = app.tasks.filter(function(t) {
                return t.stage.serverName == stage.serverName;
            });

            logger.debug('Stage ' + stage + ': ' + tasks.length + ' tasks');
            stage.tasks = tasks;
        });
        

        // delete app.issues;
        return next(null, app);
    }

};

module.exports = Application;