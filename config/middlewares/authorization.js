var logger = require(__base + 'config/logger'),
    jwt = require('jwt-simple'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.requiresLogin = function (req, res, next) {
    var token = (req.body && req.body.access_token)
        || (req.query && req.query.access_token)
        || req.headers['x-auth-token'];

    if(!token) return res.status(401).json('Invalid access token');
    authenticateToken(token, function(err, user) {
        if(err) return res.status(401).json(err);

        req.user = user;
        req.roles = user.roles;

        next();
    });
};

exports.requiresRoles = function(roles) {
    return function(roles, req, res, next) {        

        var required = _.flatten([roles]),
            possessed = req.roles,
            passed = _.intersection(required, possessed).length;

        if(passed) {
            next();
        } else {
            logger.crit('incorrect roles');
            res.redirect(403, '/');
        }

    }.bind(undefined, Array.prototype.slice.call(arguments));
}

// private functions

function authenticateToken(token, next) {
    try {
        var decoded = jwt.decode(token, 'MUST_REPLACE_WITH_A_REAL_KEY');
        if(decoded.exp <= Date.now()) 
            return next(new Error('Access token has expired'));

        var options = {
            criteria: { _id: decoded.iss },
            select: 'id name email roles'
        };

        User.load(options, function(err, user) {
            if(err) return next(err);
            if(!user) return next(new Error('Invalid access token'));

            next(null, user);
        });

    } catch (err) {
        return next(err);
    }
}