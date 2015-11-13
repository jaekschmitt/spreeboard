var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab'),    
    async = require('async'),
    _tasks = require(__base + 'lib/tasks'),
    _gitlab = require(__base + 'lib/gitlab'),
    mongoose = require('mongoose'),
    Task = mongoose.model('Task');

exports.load = function(req, res, next) {
    var options = {
        criteria: { _id : id },
        select: 'id title description stage project issue.id created_at'
    };

    Task.load(options, function(err, task) {
        if(err) return next(err);
        if(!task) return next();

        req.task = task;
        next();
    });
};

exports.create = function(req, res, next) {
    var args = {
        title: req.body.title,
        description: req.body.description,
        stage: req.body.stage,
        board: req.board,
        user: req.user
    };

    _tasks.create(args, function(err, results) {
        if(err) return res.status(500).json(err);
                
        if(!results.task.stage){
            // if there isn't yet a stage it's pending and we don't need to export
            return res.status(200).json(results.task);  
        } else {
            args = {
                task: results.task,
                user: req.user
            };

            _gitlab.issues.export(args, function(err, results) {
                if(err) return res.status(500).json(err);
                return res.status(200).json(args.task);
            });
        }        
    });
};

exports.update = function(req, res, next) {

};

exports.delete = function(req, res, next) {
    if(!req.task) return res.status(200);

    var isOwner = req.user._id == req.task.created_by,
        isDev = req.user.roles.indexOf('developer') != -1,
        isAdmin = req.user.roles.indexOf('admin') != -1;            

    var hasPermission = isOwner || isDev || isAdmin;
    if(!hasPermission) return res.status(401).json("You are not authorized to delete this task");

    Task.delete(options, function(err) {
        if(err) return res.status(500).json(err);

        if(req.task.issue) {    
            var args = {
                task: req.task,
                user: req.user
            };

            _gitlab.issues.close(args, function(err, results) {
                if(err) return res.status(500).json(err);
                return res.status(200).json(req.task);
            });

        } else {
            res.status(200).json(req.task);
        }

    });
};

exports.show = function(req, res, next) {
    if(!req.task) return res.status(500).json(new Error('Unable to find task with that id'));
    res.status(200).json(req.task);
};