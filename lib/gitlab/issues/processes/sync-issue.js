var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Board = mongoose.model('Board'),
    Task = mongoose.model('Task'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {
        issueId: args.object_attributes.id,
        projectId: args.object_attributes.project_id,
        authorId: args.object_attributes.author_id        
    };

    this.sync = function(next) {        
        logger.debug('Syncing issue: ' + app.issueId);

        async.series([
            loadTask,
            fetchFullIssue,
            adjustBoard,
            adjustStage,
            tryLoadDeveloper,
            updateTask
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            delete app['issue'];

            logger.debug(JSON.stringify(app, null, 4));

            logger.debug('Finished syncing issue with 0 errors.');
            return next(null, app);
        });
    };

    // private functions

    function loadTask(next) {
        var options = {
            criteria: { 'issue.id': app.issueId },
            select: 'id title description stage issue.id board created_by'
        };

        Task.load(options, function(err, task) {
            if(err) return next(err);
            if(!task) return next(new Error('Unable to locate task'));
            
            app.task = task;

            return next(null, app);
        });
    }

    function fetchFullIssue(next) {
        glUtils.issues.load({
            userId: app.task.created_by,
            projectId: app.projectId,
            issueId: app.issueId
        }, function(err, issue) {
            if(err) return next(err);

            delete app.projectId;
            delete app.issueId;
            app.issue = issue;

            return next(null, app);
        });
    }    

    function adjustBoard(next) {
        var labels = app.issue.labels,
            boardLabel = _.find(labels, function(l) {
                return l.indexOf('(b)') === 0;
            });

        if(!boardLabel) {
            app.board = null;  
        } else {
            var options = {
                criteria: { serverName: boardLabel },
                select: 'id'
            };

            Board.load(options, function(err, board) {
                if(err) return next(null);
                if(!board) return next(null, app);

                app.board = board._id;
                return next(null, app);
            });
        }
    }

    function adjustStage(next) {
        var labels = app.issue.labels,
            stageLabel = _.find(labels, function(l) {
                return l.indexOf('(s)') === 0;
            });

        if(!stageLabel) {
            app.stage = null;
            return next(null, app);    
        } 

        var options = {
            criteria: { 
                serverName: stageLabel, 
                type: 'stage' 
            }
        };

        Label.load(options, function(err, label) {
            if(err) return next(err);
            if(!label) return next(null, app);

            app.stage = {
                name: label.name,
                serverName: label.serverName
            };

            return next(null, app);
        });
    }

    function tryLoadDeveloper(next) {
        if(!app.issue.assignee) return next(null, app);

        var options = {
            criteria: { 'gitlab.id': app.issue.assignee.id },
            select: 'id name email'
        };

        User.load(options, function(err, user) {
            if(err) return next(err);
            if(!user) return next(null, app);

            app.developer = user._id;
            return next(null, app);
        });
    }

    function updateTask(next) {
        var task = app.task;

        task.title = app.issue.title;
        task.description = app.issue.description;        
        task.stage = app.stage;
        task.issue = app.issue;
        task.developer = app.developer ||  null;

        if(app.board != task.board)
            task.board = app.board;

        delete app['board'];
        delete app['stage'];
        delete app['authorId'];

        task.save(function(err) {
            if(err) return next(err);

            app.task = task;
            next(null, app);
        });
    }
};

module.exports = Application;