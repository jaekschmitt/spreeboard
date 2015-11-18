var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    glUtils = require(__base + 'lib/gitlab/utils'),
    request = require('request'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Board = mongoose.model('Board'),
    Task = mongoose.model('Task'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {
        task: args.task,
        taskId: args.taskId || args.task._id,
        user: args.user
    };

    this.export = function(next) {        
        logger.debug('Exporting task: ' + app.taskId);

        async.series([
            loadTask,
            loadBoard,
            postIssue
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            delete app['board'];
            delete app['taskId'];
            delete app['user'];

            logger.debug('Finished exporting task with 0 errors.');
            logger.debug(JSON.stringify(app, null, 4));
            return next(null, app);
        });
    };

    // private functions

    function loadTask(next) {
        if(app.task) return next(null, app);

        var options = {
            criteria: { _id : app.taskId },
            select: 'id title description board stage created_by created_at developer',
            populate: { 'developer': 'gitlab.id' }
        };

        Task.load(options, function(err, task) {
            if(err) return next(err);

            logger.crit(JSON.stringify(task, null, 4));

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

            app.board = board;
            next(null, app);
        });
    }

    function postIssue(next){ 
        var url = config.gitlab.api + 'projects/' + app.board.project.id + '/issues',
            task = app.task,
            issueInfo = {
                title: task.title,
                description: task.description,                
                labels: app.board.serverName + ',' + task.stage.serverName
            };

        if(task.developer && task.developer.gitlab)
            issueInfo.assignee_id = task.developer.gitlab.id;        

        glUtils.userToken(app.user._id, function(err, token) {

            request.post({
                url: url,
                headers: { 'PRIVATE-TOKEN' : token },
                form: issueInfo                
            }, function(err, response, body) {
                if(err || [200, 201].indexOf(response.statusCode) < 0) {
                    return next(new Error("Error communicating with Gitlab server"));
                }

                task.issue = JSON.parse(body);                
                task.updated_at = new Date();

                task.save(function(err) {
                    if(err) return next(err);
                    next(null, app);
                });
            });

        });
    }
};

module.exports = Application;