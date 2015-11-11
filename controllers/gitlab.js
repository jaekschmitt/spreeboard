var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab'),    
    async = require('async'),
    _ = require('lodash');

exports.projects = function(req, res, next) { 
    glUtils.list('projects', req.user.id, function(err, projects) {
        if(err) return res.status(500).json(err);
        res.status(200).json(projects);
    });
};

exports.issuesSync = function(req, res, next) {
    logger.debug(req.body);
}