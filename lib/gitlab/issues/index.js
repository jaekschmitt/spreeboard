var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    request = require('request'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    GLUtils = require('../utils');

exports.pull = function(args, next) {
    var IssuePull = require('./processes/pull-issue');

    var application = new IssuePull(args);
    application.pull(next);
};

exports.push = function(args, next) {
    var IssuePush = require('./processes/push-issue');

    var application = new IssuePush(args);
    application.push(next);
};

exports.close = function(args, next) {
    var IssueClose = require('./processes/close-issue');

    var application = new IssueClose(args);
    application.close(next);
}

exports.load = function(args, next) {
    GLUtils.userToken(args.userId, function(err, token){
        if(err) return next(err);

        var url = config.gitlab.api +
                'projects/' + args.projectId +
                '/issues/' + args.issueId +
                '?private_token=' + token;

        request(url, function(err, res, body) {
            if(err) return next(err);
            next(null, JSON.parse(body));
        });
    });
};