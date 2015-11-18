var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    glUtils = require(__base + 'lib/gitlab'),    
    async = require('async'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    _boards = require(__base + 'lib/boards');

exports.show = function(req, res, next) {
    
};

exports.list = function(req, res, next) {
    
};

exports.new = function(req, res, next) {    
    res.render('projects/new');
};

exports.create = function(req, res, next) {
    // req.body.stages = req.body.stages || [];
    // req.body.stages.unshift('Backlog');

    // var args = {
    //     name: req.body.name,
    //     projectId: req.body.project,
    //     stages: req.body.stages,
    //     user: req.user
    // };

    // _boards.create(args, function(err, results) {
    //     if(err) return res.redirect('/boards/new');
    //     res.redirect('/boards/' + results.board.id);
    // });
};

exports.update = function(req, res, next) {

};

exports.delete = function(req, res, next) {

};