var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {
        boardId: args.board ? args.board._id : args.boardId,
        board: args.board,
        labels: args.labels,
        user: args.user
    };

    this.update = function(next) {
        logger.debug('Updating labels for board: ' + app.boardId);

        async.series([
            fetchBoard,
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
    function fetchBoard(next) {
        if(app.board) return next(null, app);

        Board.findOne({
            _id: app.boardId
        }).exec(function(err, board) {
            if(err) return next(err);
            
            app.board = board;
            next(null, app);
        });
    }

    function buildLabels(next) {

    }
};

module.exports = Application;