var IssuesFetch = require('./processes/fetch-issues');

exports.fetch = function(args, next) {
    var application = new IssuesFetch(args);
    application.fetch(next);
}