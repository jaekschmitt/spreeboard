var logger = require(__base + 'config/logger'),    
    db = require(__base + 'config/mongoose-db'),
    async = require('async'),
    _ = require('lodash'),
    _gitlab = require(__base + 'lib/gitlab');

var Application = function(args) {
    var app = {
        issueId: args.object_attributes.id,
        projectId: args.object_attributes.project_id,
        authorId: args.object_attributes.author_id        
    };    

    this.import = function(next) {        
        logger.debug('Importing issue: ' + app.issueId);

        async.waterfall([
            loadAuthor,
            fetchFullIssue,
            attachBoard,
            createTask,            
            determineStage
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            delete app['issue'];

            logger.debug('Finished importing issue with 0 errors.');
            return next(null, app);
        });
    };

    // private functions

    function loadAuthor(next) {
        var options = {
            criteria: { 'gitlab.id': app.authorId },
            select: 'id email name'
        };

        db.User.load(options, function(err, user) {            
            if(err) return next(err);
            if(!user) return next(new Error('User has not yet logged into spreeboards'));

            delete app.authorId;
            app.author = user;

            return next(null, app);
        });
    }

    function fetchFullIssue(app, next) {
        _gitlab.issues.load({
            userId: app.author._id,
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

    function attachBoard(app, next) {
        var labels = app.issue.labels || [],
            boardLabel = _.find(labels, function(l) {
                return l.indexOf('(b)') === 0;
            });

        if(!boardLabel) return next(new Error('No board label present'));        

        var options = {
            criteria: { serverName: boardLabel },
            select: 'id name serverName'
        };

        db.Board.load(options, function(err, board) {
            if(err) return next(null);
            if(!board) return next(null, app);

            app.board = board;
            next(null, app);
        });
    }

    function createTask(app, next) {    
        var task = new db.Task(app.issue);

        task.issue = app.issue;
        task.board = app.board ? app.board._id : null;
        task.sync_lock = false;
        task.created_by = app.author._id;

        task.save(function(err) {
            if(err) return next(err);

            app.task = task;
            next(null, app);
        });
    }    

    function determineStage(app, next) {
        var labels = app.issue.labels,
            stageLabel = _.find(labels, function(l) {
                return l.indexOf('(s)') === 0;
            });

        if(!stageLabel) return next(null, app);

        var options = {
            criteria: { 
                serverName: stageLabel, 
                type: 'stage' 
            }
        };

        db.Label.load(options, function(err, label) {
            if(err) return next(err);
            if(!label) return next(null, app);

            app.task.stage = {
                name: label.name,
                serverName: label.serverName
            };

            app.task.save(function(err) {
                if(err) return next(err);
                return next(null, app);
            });
        })

    }
};

module.exports = Application;