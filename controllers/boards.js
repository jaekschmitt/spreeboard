var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board');

exports.show = function(req, res, next) {
    Board.findOne({
        id: req.params.id
    }).exec(function(err, board) {
        res.render('boards/show');
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
    glUtils.projects.list(req.user.id, function(err, projects) {
        res.render('boards/new', {
            board: new Board({}),
            projects: projects
        });
    });    
};

exports.create = function(req, res, next) {
    req.body.stages = req.body.stages || [];

    req.body.stages.unshift('Backlog');

    logger.crit(JSON.stringify(req.body, null, 4));
    return res.redirect('/boards/new');    

    // glUtils.projects.load({
    //     userId: req.user.id,
    //     projectId: req.body.project
    // }, function(err, project) {    
    //     var board = new Board({
    //         name: req.body.name,
    //         project: project
    //     });

    //     board.save(function(err) {    
    //         if(err) {
    //             return res.render('boards/new', {
    //                 board: req.body,
    //                 projects: []
    //             });
    //         }

    //         return res.redirect('/boards/' + board.id);            
    //     });
    // });
};

exports.update = function(req, res, next) {

};

exports.delete = function(req, res, next) {

};