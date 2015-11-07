var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {        
        board: args.board,
        boardId: args.boardId || args.board.id,
        user: args.user
    };

    this.fetch = function(next) {
        logger.debug('Fetching issues for board: ' + app.boardId);

        async.series([
            loadBoard,
            getIssuesForBoard
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            logger.debug('Finished fetching issues with 0 errors.');
            return next(null, app.issues);
        });
    };

    // private functions

    function loadBoard(next) {
        if(app.board) return next(null, app);

        Board.findOne({
            _id: app.boardId
        }).exec(function(err, board) {
            if(err) return next(err);
            logger.crit(board);
            
            app.board = board;
            next(null, app);
        });
    }

    function getIssuesForBoard(next) {
        glUtils.issues.forBoard({
            userId: app.user.id,
            board: app.board
        },function(err, issues) {
            if(err) return next(err);            

            app.issues = issues;
            next(null, app);            
        });
    }

};

module.exports = Application;