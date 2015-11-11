var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab'),    
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    _boards = require(__base + 'lib/boards');

    exports.new = function(req, res, next) {        
        res.render('tasks/new', {
            board: req.board,
            user: req.user
        });
    };

    exports.create = function(req, res, next) {

    };