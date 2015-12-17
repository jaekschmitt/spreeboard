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
        priority: req.body.priority,
        size: req.body.size,
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

    var task = req.task,
        isOwner = req.user._id == task.created_by,
        isDev = req.user.roles.indexOf('developer') != -1,
        isAdmin = req.user.roles.indexOf('admin') != -1;            

    var hasPermission = isOwner || isDev || isAdmin;
    if(!hasPermission) return res.status(401).json("You are not authorized to delete this task");

    task.status = 'closed';    
    task.last_status_update = new Date();    

    task.save(function(err) {
        if(err) return res.status(500).json(err);        

        if(task.issue && req.user.roles.indexOf('developer') > -1) {
            var pkg = { taskId: task._id, user: req.user.toJSON() };
                        
            logger.debug('Launching close issue job for gitlab.');
            agenda.now('close-issue', pkg);
        }
        
        res.status(200).json(task);
    });
};

exports.complete = function(req, res, next) {
    if(!req.task) return res.status(200);

    var task = req.task,        
        isDev = req.user.roles.indexOf('developer') != -1;        

    if(!isDev) return res.status(401).json("You are not authorized to complete this task");

    task.status = 'completed';
    task.last_status_update = new Date();

    task.save(function(err) {
        if(err) return res.status(500).json(err);

        if(task.issue && isDev) {
            var pkg = { taskId: task._id, user: req.user.toJSON() };

            logger.debug('Launching close issue job for gitlab');
            agenda.now('close-issue', pkg);
        }

        res.status(200).json(task);
    });
};

exports.show = function(req, res, next) {
    var task = req.task;

    if(!task) return res.status(500).json(new Error('Unable to find task with that id'));    

    res.status(200).json(task);
};

exports.search = function(req, res, next) {
    var params = req.query,
        options = {
            criteria: {},
            select: 'id title description stage priority size project board issue.iid created_at developer owner approved'
        };

    logger.crit(params);

    if(params.board) options.criteria.board = params.board;
    if(params.status) options.criteria.status = params.status;
    if(params.stage) options.criteria['stage.name'] = params.stage;
    if(params.size) options.criteria['size.name'] = params.size;
    if(params.priority) options.criteria['priority.name'] = params.priority;

    db.Task.list(options, function(err, tasks) {
        if(err) return res.status(500).json(err);
        res.status(200).json(tasks);
    });
}