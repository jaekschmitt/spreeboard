var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {
        name: args.name,
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
            findStage,
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
        
    }
};

module.exports = Application;