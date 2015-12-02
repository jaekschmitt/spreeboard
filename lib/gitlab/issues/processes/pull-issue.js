var logger = require(__base + 'config/logger'),    
    db = require(__base + 'config/mongoose-db'),
    async = require('async'),
    _ = require('lodash'),
    _gitlab = require(__base + 'lib/gitlab');

var Application = function(args) {
    var app = {
        issue: args,
        task: null
    };    

    this.pull = function(next) {        
        
        async.waterfall([
            attachCreatedBy,
            fetchIssue,
            attachBoard,            
            attachDeveloper,
            function(app, cb) { return attachLabelAttr(app, 'stage', '(s)', cb); },
            function(app, cb) { return attachLabelAttr(app, 'priority', '(p)', cb); },
            function(app, cb) { return attachLabelAttr(app, 'size', '(sz)', cb); },
            updateTask,
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
    
    function attachCreatedBy(next) {
        var options = {
            criteria: { 'gitlab.id': app.issue.author_id },
            select: 'id email name'
        };

        db.User.load(options, function(err, author) {            
            if(err) return next(err);
            if(!author) return next(new Error('Author is not appart of our system.'));

            app.createdBy = author;
            return next(null, app);
        });
    }
    function fetchIssue(app, next) {        
        var pkg = {
            issueId: app.issue.id,
            projectId: app.issue.project_id,
            userId: app.createdBy._id
        };

        _gitlab.issues.load(pkg, function(err, issue) {                
            if(err) return next(err);

            app.issue = issue;
            return next(null, app);
        });
    }

    function attachBoard(app, next) {
        var labels = app.issue.labels || [],
            boardLabel = _.find(labels, function(l) {
                return l.indexOf('(b)') === 0;
            });

        var options = {
            criteria: { serverName: boardLabel },
            select: 'id name serverName'
        };

        db.Board.load(options, function(err, board) {
            if(err) return next(err);            
            
            app.board = board;
            next(null, app);
        });

    }    

    function attachLabelAttr(app, type, serverKey, next) {
        var labels = app.issue.labels,
            serverLabel = _.find(labels, function(l) {
                return l.indexOf(serverKey) === 0;
            });

        if(!serverLabel) return next(null, app);

        var options = {
            criteria: { serverName: serverLabel, type: type }
        };

        db.Label.load(options, function(err, label) {
            if(err) return next(err);
            if(!label) return next(null, app);

            app[type] = label;
            return next(null, app);
        });
    }    

    function attachDeveloper(app, next) {
        if(!app.issue.assignee) return next(null, app);

        var options = {
            criteria: { 'gitlab.id': app.issue.assignee.id },
            select: 'id name'
        };

        db.User.load(options, function(err, dev) {
            if(err) return next(err);            

            app.developer = dev;
            return next(null, app);
        });
    }

    function updateTask(app, next) {
        var options = {
            criteria: { 'issue.id': app.issue.id }            
        };

        db.Task.load(options, function(err, task) {
            if(err) return next(err);
            
            if(!task) {
                logger.debug('Unable to find existing task -> creating a new one.');
                task = new db.Task();
            }

            task.title = app.issue.title;
            task.description = app.issue.description;
            task.board = app.board ? app.board._id : null;
            
            task.stage = app.stage;
            task.priority = app.priority;
            task.size = app.size;

            task.developer = app.developer ? app.developer._id : null;
            task.created_by = app.createdBy._id;            
            task.approved = true;            

            task.issue = app.issue;

            task.status = 'active';
            task.last_status_update = new Date();

            task.save(function(err) {
                if(err) return next(err);

                app.task = task;
                next(null, app);
            });
        });
    }
};

module.exports = Application;