var BoardCreation = require('./processes/create-board'),
    BoardFetch = require('./processes/fetch-board'),
    LabelUpdate = require('./processes/update-labels');

exports.create = function(args, next) {
    var application = new BoardCreation(args);
    application.create(next);
};

exports.fetch = function(args, next) {
    var application = new BoardFetch(args);
    application.fetch(next);
};

exports.updateLabels = function(args, next) {
    var application = new LabelUpdate(args);
    application.update(next);
};