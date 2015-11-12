var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    GLab = require(__base + 'lib/gitlab'),    
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Task = mongoose.model('Task');

exports.projects = function(req, res, next) { 
    GLab.list('projects', req.user.id, function(err, projects) {
        if(err) return res.status(500).json(err);
        res.status(200).json(projects);
    });
};

exports.issuesSync = function(req, res, next) {
    var issueInfo = req.body,
        direction = req.body.object_attributes.action;

    // testing web hook body
    // logger.debug(JSON.stringify(issueInfo, null, 4));
    // next();

    if(['open', 'reopen'].indexOf(direction) > -1) {
        
        GLab.issues.import(issueInfo, function(err, results) {
            logger.debug(JSON.stringify(results, null, 4));
            res.status(200);
            next();
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

    }
}