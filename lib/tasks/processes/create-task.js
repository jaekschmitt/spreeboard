var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Task = mongoose.model('Task');

var Application = function(args) {
    var app = {
        title: args.title,
        description: args.description,
        stage: args.stage,
        board: args.board,
        boardId: args.boardId || args.board.id,
        user: args.user
    };

    this.create = function(next) {
        logger.debug('Creating task for board: ' + app.boardId);

        async.series([
            loadBoard,
            createTask
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            logger.debug('Finished creating task with 0 errors.');
            return next(null, app);
        });
    };

    // private functions

    function loadBoard(next) {
        if(app.board) return next(null, app);

        var options = {
            criteria: { _id : app.boardId },
            select: 'id name'
        };

        Board.load(options, function(err, board) {
            if(err) return next(err);
            logger.crit(board);
            
            app.board = board;
            next(null, app);
        });
    }

    function createTask(next) {
        var task = new Task(app);

        task.created_by = app.user._id;

        task.save(function(err) {
            if(err) return next(err);

            app.task = task;
            next(null, task);
        });
    }
};

module.exports = Application;