var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
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

    this.update = function(next) {        
        logger.debug('Pushing changes for task: ' + app.taskId);

        async.series([
            loadTask,
            loadBoard,
            updateIssue
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            delete app['board'];
            delete app['taskId'];
            delete app['user'];

            logger.debug('Finished pushing changes for task with 0 errors.');            
            return next(null, app);
        });
    };

    // private functions

    function loadTask(next) {
        if(app.task) return next(null, app);        

        var options = {
            criteria: { _id : app.taskId },
            select: 'id title description board stage issue.id created_by created_at developer',
            populate: { 'developer': 'gitlab.id' }
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
            select: 'id name serverName project.id'
        };

        Board.load(options, function(err, board) {
            if(err) return next(err);            
            if(!board) return next(new Error('Unable to find tasks(' + app.task._id + ') board'));

            app.board = board;
            next(null, app);
        });
    }

    function updateIssue(next){ 
        var url = config.gitlab.api + 'projects/' + app.board.project.id + '/issues/' + app.task.issue.id,
            task = app.task,
            body = { 
                title: task.title,
                description: task.description,
                labels: app.board.serverName + ',' + task.stage.serverName,
                assignee_id: 0
            };

        if(task.developer && task.developer.gitlab)
            body.assignee_id = task.developer.gitlab.id;

        logger.crit(JSON.stringify(body, null, 4));

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