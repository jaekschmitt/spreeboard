var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),    
    _glUtils = require('../utils'),
    request = require('request'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.members = function(args, next) {
    _glUtils.userToken(args.userId, function(err, token) {
        if(err) return next(err);

        var url = config.gitlab.api +
            'projects/' + args.projectId +
            '/members?private_token=' + token;

        request(url, function(err, res, body) {
            if(err) return next(err);
            next(null, JSON.parse(body));
        });
    });
};
