var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    request = require('request'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    GLUtils = require('../utils');

exports.import = function(args, next) {
    var IssueImport = require('./processes/import-issue');

    var application = new IssueImport(args);
    application.import(next);
};

exports.export = function(args, next) {
    var IssueExport = require('./processes/export-issue');

    var application = new IssueExport(args);
    application.export(next);
};

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

// going away

exports.forBoard = function(args, next) {
    args.state = args.state || 'opened';

     GLUtils.userToken(args.userId, function(err, token) {
        if(err) return next(err, []);
    
        var url = config.gitlab.api + 
                'projects/' + args.board.project.id + 
                '/issues?';

        url += 'state=' + args.state + '&';
        url += 'private_token=' + token + '&';

        var labels = [args.board.labelName];
        if(args.stage) {
            labels.push(args.stage);
        }

        url += 'labels=' + labels.join(',');

        request(url, function(err, res, body) {
            if(err) return next(err);

            var issues = JSON.parse(body);            
            next(null, issues);
        });
    });
};
