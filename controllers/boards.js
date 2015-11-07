var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab'),    
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    _boards = require(__base + 'lib/boards');

exports.show = function(req, res, next) {
    var args = {
        boardId: req.params.id,
        user: req.user
    };

    _boards.fetch(args, function(err, results) {
        if(err) return res.redirect('/boards');

        logger.crit(JSON.stringify(results.stages, null, 4));

        res.render('boards/show', {
            board: results.board,
            stages: results.stages
        });
    });
};

exports.list = function(req, res, next) {
    Board.find().exec(function(err, boards) {
        res.render('boards', {
            user: req.user,
            boards: boards
        });
    });
};

exports.new = function(req, res, next) {    
    glUtils.list('projects', req.user.id, function(err, projects) {
        res.render('boards/new', {
            board: new Board({}),
            projects: projects
        });
    });
};

exports.create = function(req, res, next) {
    req.body.stages = req.body.stages || [];
    req.body.stages.unshift('Backlog');

    var args = {
        name: req.body.name,
        projectId: req.body.project,
        stages: req.body.stages,
        user: req.user
    };

    _boards.create(args, function(err, results) {
        if(err) return res.redirect('/boards/new');
        res.redirect('/boards/' + results.board.id);
    });
};

exports.update = function(req, res, next) {

};

exports.delete = function(req, res, next) {

};