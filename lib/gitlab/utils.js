var logger = require(__base + 'config/logger'),
    config = require(__base + 'config/config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.userToken = function(id, cb) {
    User.load({
        criteria: { _id : id },
        select: 'id name gitlab.private_token'
    }, function(err, user) {
        if(err) return cb(err);
        return cb(null, user.gitlab.private_token);
    });
};

exports.client = function(token) {
    return require('gitlab')({
        url: config.gitlab.url,
        token: token
    });
};