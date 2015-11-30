var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),    
    agenda = require(__base + 'config/agenda'),    
    db = require(__base + 'config/mongoose-db'),    
    _tasks = require(__base + 'lib/tasks'),
    _gitlab = require(__base + 'lib/gitlab'),
    async = require('async'),
    _ = require('lodash');

exports.load = function(req, res, next, id) {
    var options = {
        criteria: { _id : id },
        select: 'id title description stage priority size project board issue.iid created_at developer owner approved',
        populate: { 
            'developer': 'id name email',
            'owner': 'id name email'
        }
    };

    db.Task.load(options, function(err, task) {        
        if(err) return next(err);

        req.task = task;
        next();
    });
};

exports.create = function(req, res, next) {
    var args = {
        title: req.body.title,
        description: req.body.description,
        stage: req.body.stage,
        developer: req.body.developer,
        owner: req.body.owner,
        board: req.board,
        user: req.user
    };    

    _tasks.create(args, function(err, results) {
        if(err) return res.status(500).json(err);                
                    
        if(results.task.stage && results.task.approved) {
            var pkg = { taskId: results.task._id, user: req.user.toJSON() };

            logger.debug('Launching push issue job for gitlab.')
            agenda.now('push-issue', pkg);
        }
                    
        return res.status(200).json(results.task);
    });
};

exports.update = function(req, res, next) {
    if(!req.task) return res.status(500).json(new Error('Unable to find task with that id'));        

    var task = _.extend(req.task, req.body);
    task.save(function(err) {
        if(err) return res.status(500).json(err);

        if(task.approved && req.user.roles.indexOf('developer') > -1) {
            var pkg = { taskId: task._id, user: req.user.toJSON() };        

            logger.debug('Launching push issue job for gitlab.');
            agenda.now('push-issue', pkg);
        }

        return res.status(200).json({});
    });
};

exports.delete = function(req, res, next) {
    if(!req.task) return res.status(200);

    var isOwner = req.user._id == req.task.created_by,
        isDev = req.user.roles.indexOf('developer') != -1,
        isAdmin = req.user.roles.indexOf('admin') != -1;            

    var hasPermission = isOwner || isDev || isAdmin;
    if(!hasPermission) return res.status(401).json("You are not authorized to delete this task");

    req.task.remove(function(err) {
        if(err) return res.status(500).json(err);

        if(req.task.issue && req.user.roles.indexOf('developer') > -1) {
            var pkg = { task: req.task.toJSON(), user: req.user.toJSON() };

            logger.debug('Launching close issue job for gitlab.');
            agenda.now('close-issue', pkg);
        }
        
        res.status(200).json(req.task);
    });
};

exports.show = function(req, res, next) {
    var task = req.task;

    if(!task) return res.status(500).json(new Error('Unable to find task with that id'));    

    res.status(200).json(task);
};