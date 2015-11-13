var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab'),    
    async = require('async'),
    _tasks = require(__base + 'lib/tasks'),
    _gitlab = require(__base + 'lib/gitlab'),
    mongoose = require('mongoose'),
    Task = mongoose.model('Task');

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

exports.show = function(req, res, next) {
    var options = {
        criteria: { _id : req.params.id },
        select : 'id title description stage project created_at'        
    };

    Task.load(options, function(err, task) {
        if(err) return res.status(500).json(err);
        if(!task) return res.status(500).json(new Error('Unable to find task with that id'));        

        res.status(200).json(task);
    });
};