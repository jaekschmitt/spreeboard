var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    request = require('request'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    GLUtils = require('../utils');

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
