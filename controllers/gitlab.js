var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    _gitlab = require(__base + 'lib/gitlab'),    
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Task = mongoose.model('Task');

exports.projects = function(req, res, next) { 
    _gitlab.list('projects', req.user.id, function(err, projects) {
        if(err) return res.status(500).json(err);
        res.status(200).json(projects);
    });
};

exports.issuesSync = function(req, res, next) {
    var issueInfo = req.body,
        direction = req.body.object_attributes.action;

    logger.crit(JSON.stringify(issueInfo, null, 4));

    if(['open', 'reopen'].indexOf(direction) > -1) {
        // hate this but the web hook for new issues is too fast 
        // and is importing before we update issue in existing task and
        // can query against it.  would ideally search by issue.id == issueInfo.id

        var options = {
            criteria: { 
                $or: [
                    { 'title' : issueInfo.object_attributes.title },
                    { 'issue.id' : issueInfo.object_attributes.id }
                ]
            },
            select: 'id sync_lock issue.id'
        };

        Task.load(options, function(err, task) {            
            if(err || !task || task.issue) return next(err);

            if(task.sync_lock) {
                logger.crit('locked');

                task.sync_lock = false;
                task.save();

                res.status(200);
            }else {
                logger.crit('no locked');
                logger.crit(JSON.stringify(issueInfo, null, 4));                

                _gitlab.issues.import(issueInfo, function(err, results) {                
                    res.status(200);
                    next();
                });
            }
                        
        });        

    } else if(direction == 'close') {
        var options = {
            criteria: { 'issue.id': issueInfo.object_attributes.id }
        };

        Task.delete(options, function(err, task) {
            if(err) logger.crit(err);
            if(!task) return next();

            logger.debug('Deleted task(' + task._id + ') per Gitlabs request');

            res.status(200);
            next();
        });
    } else if(direction === 'update') {
        var options = {
            criteria: { 'issue.id' : issueInfo.object_attributes.id },
            select: 'id sync_lock'
        };

        Task.load(options, function(err, task) {
            if(err || !task) {
                logger.crit(err);
                return next();
            }

            if(task.sync_lock) {
                logger.crit('locked');

                task.sync_lock = false;
                task.save();

                return next();
            } else {

                _gitlab.issues.sync(issueInfo, function(err, results) {
                    res.status(200);
                    next();
                });
            }
                    
        });
    }
}