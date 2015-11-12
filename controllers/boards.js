var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),    
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label'),
    _boards = require(__base + 'lib/boards');

exports.load = function(req, res, next, id) {
    async.parallel({
        boardFetch: function(cb) { Board.findOne({ _id: id }).exec(cb) },
        labelFetch: function(cb) { Label.find({ board: id }).exec(cb) }
    }, function(err, results) {
        if(err) return next(err);        

        req.board = results.boardFetch;

        var groupedLabels = _.groupBy(results.labelFetch, 'type');        
        req.board.labels = groupedLabels['label'] || [];

        next();
    });
};

exports.show = function(req, res, next) {
    var args = {
        boardId: req.params.id,
        user: req.user
    };

    _boards.fetch(args, function(err, results) {
        if(err) return res.status(500).json(err);

        res.status(200).json({
            board: results.board,
            stages: results.stages
        });
    });
};

exports.list = function(req, res, next) {
    Board.find().exec(function(err, boards) {
        if(err) return res.status(500).json(err);
        res.status(200).json(boards);
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
        if(err) return res.status(500).json(err);
        res.status(200).json(results.board);
    });
};

exports.edit = function(req, res, next) {
    res.render('boards/edit', {
        board: req.board,
        user: req.user
    });
};

exports.update = function(req, res, next) {

};

exports.updateLabels = function(req, res, next) {
    logger.debug(req.body);

    var args = {
        board: req.board,
        labels: req.body.labels,
        user: req.user
    };

    _boards.updateLabels(args, function(err, results) {
        req.board.labels = results.labels;

        res.render('boards/edit', {
            board: req.board,
            user: req.user
        });
    })    
};

exports.delete = function(req, res, next) {

};