var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');


    
exports.load = function(entity, args, callback) {
    getUserToken(args.userId, function(err, token) {
        if(err) return callback(err, []);

        gitlabClient(token)[entity]
            .show(args.id, function(result) {
                callback(null, result);
            });
    });
};

exports.list = function(entity, id, callback) {
    getUserToken(id, function(err, token) {
        if(err) return callback(err, []);
    
        gitlabClient(token)[entity]
            .all(function(results) {
                callback(null, results);
            });
    });
};


// Private utility functions

function getUserToken(id, cb) {
    User.load({
        criteria: { _id : id },
        select: 'id name gitlab.private_token'
    }, function(err, user) {
        if(err) return cb(err);
        return cb(null, user.gitlab.private_token);
    });
}

function gitlabClient(token) {
    return require('gitlab')({
        url: config.gitlab.url,
        token: token
    });
}