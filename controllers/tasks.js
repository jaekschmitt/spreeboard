var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab'),    
    async = require('async'),
    _tasks = require(__base + 'lib/tasks');

exports.create = function(req, res, next) {
    var args = {
        title: req.body.title,
        description: req.body.description,
        stage: req.body.stage,
        board: req.board,
        user: req.user
    };

    _tasks.create(args, function(err, task) {
        if(err) return res.status(500).json(err);
        return res.status(200).json(task);
    });
};