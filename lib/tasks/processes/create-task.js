var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    db = require(__base + 'config/mongoose-db'),
    async = require('async')    

var Application = function(args) {
    var app = {
        title: args.title,
        description: args.description,
        stage: args.stage,
        developer: args.developer,
        owner: args.owner,
        board: args.board,
        boardId: args.boardId || args.board.id,
        user: args.user
    };

    this.create = function(next) {
        logger.debug('Creating task for board: ' + app.boardId);

        async.waterfall([
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

        db.Board.load(options, function(err, board) {
            if(err) return next(err);
            if(!board) return next(new Error('No board attached'));
            
            app.board = board;
            next(null, app);
        });
    }

    function createTask(app, next) {        
        var task = new db.Task(app);
        
        task.sync_lock = true;
        task.created_by = app.user._id;
            
        task.save(function(err) {
            if(err) return next(err);

            app.task = task;
            next(null, task);
        });
    }
};

module.exports = Application;