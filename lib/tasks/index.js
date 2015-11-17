exports.create = function(args, next) {
    var BoardCreation = require('./processes/create-task');

    var application = new BoardCreation(args);
    application.create(next);
};

exports.update = function(args, next) {
    var BoardUpdate = require('./processes/update-task');

    var application = new BoardUpdate(args);
    application.update(next);
};