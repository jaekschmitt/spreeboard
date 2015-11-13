var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab/utils'),
    request = require('request'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Board = mongoose.model('Board'),
    Task = mongoose.model('Task');

var Application = function(args) {
    var app = {
        task: args.task,
        taskId: args.taskId || args.task._id,
        user: args.user
    };

    this.close = function(next) {        
        logger.debug('Closing task: ' + app.taskId);

        async.series([
            loadTask,
            loadBoard,
            closeIssue
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            delete app['board'];
            delete app['taskId'];
            delete app['user'];

            logger.debug('Finished closing task with 0 errors.');
            logger.debug(JSON.stringify(app, null, 4));
            return next(null, app);
        });
    };

    // private functions

    function loadTask(next) {
        if(app.task) return next(null, app);        

        var options = {
            criteria: { _id : app.taskId },
            select: 'id board issue'
        };

        Task.load(options, function(err, task) {
            if(err) return next(err);

            app.task = task;
            next(null, app);
        });
    }

    function loadBoard(next) {
        var options = {
            criteria: { _id : app.task.board },
            select: 'id project.id'
        };

        Board.load(options, function(err, board) {
            if(err) return next(err);            
            if(!board) return next(new Error('Unable to find tasks(' + app.task._id + ') board'));

            app.board = board;
            next(null, app);
        });
    }

    function closeIssue(next){ 
        var url = config.gitlab.api + 'projects/' + app.board.project.id + '/issues/' + app.task.issue.id,
            body = { 'state_event': 'close' };

        glUtils.userToken(app.user._id, function(err, token) {
            console.log('url: ' + url + ', token: ' + token);


            request.put({
                url: url,
                headers: { 'PRIVATE-TOKEN' : token },
                form: body                
            }, function(err, response, body) {
                if(err) {
                    next(err);  
                } else if ([200, 201].indexOf(response.statusCode) < 0) {                
                    next(new Error("Error communicating with Gitlab server"));
                } else {
                    next(null, app);                
                }
            });
        });
    }
};

module.exports = Application;