exports.create = function(args, next) {
    var BoardCreation = require('./processes/create-task');

    var application = new BoardCreation(args);
    application.create(next);
};