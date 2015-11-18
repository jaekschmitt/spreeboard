var BoardCreation = require('./processes/create-board'),
    BoardFetch = require('./processes/fetch-board'),
    AddAttribute = require('./processes/add-attribute'),
    RemoveAttribue = require('./processes/remove-attribute');

exports.create = function(args, next) {
    var application = new BoardCreation(args);
    application.create(next);
};

exports.fetch = function(args, next) {
    var application = new BoardFetch(args);
    application.fetch(next);
};

exports.addAttribute = function(args, next) {
    var application = new AddAttribute(args);
    application.add(next);
};

exports.removeAttribute = function(args, next) {
    var application = new RemoveAttribue(args);
    application.remove(next);
};