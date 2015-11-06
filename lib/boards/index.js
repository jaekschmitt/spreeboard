var BoardCreation = require('./processes/create-board');

exports.create = function(args, next) {
    var application = new BoardCreation(args);
    application.create(next);
}
