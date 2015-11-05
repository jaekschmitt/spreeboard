var logger = require('../config/logger'),
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
            boards: boards
        });
    });
};

exports.new = function(req, res, next) {
    logger.crit(req.session.passport);

    res.render('boards/new', {
        board: new Board({})
    });
};

exports.create = function(req, res, next) {

};

exports.update = function(req, res, next) {

};

exports.delete = function(req, res, next) {

};