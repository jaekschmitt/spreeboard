var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label'),
    User = mongoose.model('User'),
    _boards = require(__base + 'lib/boards');    

exports.load = function(req, res, next, id) {
    var options = {
        criteria: { _id : id },
        select: 'id name serverName created_by created_at stages priorities sizes project.id'
    };    

    Board.load(options, function(err, board) {
        if(err) return next(err);
        if(!board) return next();        

        req.board = board;
        next();
    });
};

exports.info = function(req, res, next) {
    var options = {
            criteria: { roles: 'developer' },
            select: 'id name email'
        };

    User.list(options, function(err, users) {
        if(err) return res.status(500).json(err);

        // release mongoose's hold on the object so we can attach other properties to it.
        var board = req.board.toJSON();
        board.developers = users;

        res.status(200).json(board);
    });    
};

exports.settings = function(req, res, next) {
    var options = {
        criteria: { board : req.board._id },
        select: 'id name serverName type'        
    };

    Label.list(options, function(err, labels) {
        if(err) return res.status(500).json(err);

        var grouped = _.groupBy(labels, 'type');

        req.board.stages = grouped.stage || [];
        req.board.priorities = grouped.priority || [];
        req.board.sizes = grouped.size || [];

        res.status(200).json(req.board);
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

exports.update = function(req, res, next) {};
exports.delete = function(req, res, next) {};

/**
* Board Attributes
*/

exports.addBoardAttr = function(req, res, next) {
    var args = {        
        type: req.params.type,
        name: req.body.name,
        board: req.board,
        user: req.user
    };

    // logger.crit(JSON.stringify(args, null, 4));
    _boards.addAttribute(args, function(err, results){ 
        if(err) return res.status(500).json(err);

        logger.crit(JSON.stringify(results, null, 4));
        res.status(200).json(results.label);
    });    
};

exports.deleteBoardAttr = function(req, res, next) {
    var args = {
        type: req.params.type,
        attrId: req.params.id,
        board: req.board,
        user: req.user
    };

    _boards.removeAttribute(args, function(err, results) {
        if(err) return res.status(500).json(err);

        logger.crit(JSON.stringify(results, null, 4));
        res.status(200).json(results);
    });
};