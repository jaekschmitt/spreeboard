var BoardCreation = require('./processes/create-board'),
    BoardFetch = require('./processes/fetch-board');

exports.create = function(args, next) {
    var application = new BoardCreation(args);
    application.create(next);
};

exports.fetch = function(args, next) {
    var application = new BoardFetch(args);
    application.fetch(next);
};