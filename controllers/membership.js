var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    jwt = require('jwt-simple'),
    _ = require('lodash'),
    ActiveDirectory = require('activedirectory'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.register = function(req, res, next) {
    var user = new User(req.body);
    user.provider = 'local';
    user.save(function(err) {
        if(err) return res.status(500).json(err);
        res.status(200).json(buildAuthPkg(user));       
    });
};

exports.signIn = function(req, res, next) {
    var options = {
        criteria: { email: req.body.email },
        select: 'name email hashed_password salt roles'
    };

    User.load(options, function(err, user) {    
        if (err) return res.status(500).json(err);
        if (!user) return res.status(401).json({ message: 'Unknown user' });
        if (!user.authenticate(req.body.password)) return res.status(401).json({ message: 'Invalid password' });
    
        return res.status(200).json(buildAuthPkg(user));
    });
};

exports.ldap = function(req, res, next) {
    var ad = new ActiveDirectory(config.active_directory);

    logger.debug('LDAP login with: ' + req.body.username + '|' + req.body.password);

    ad.authenticate(req.body.username, req.body.password, function(err, auth) {        
        if(err) return res.status(500).json(err);
        
        var userLdap = new ActiveDirectory({
            url: config.active_directory.url,
            baseDN: config.active_directory.baseDN,
            username: req.body.username,
            password: req.body.password
        });

        userLdap.findUsers('cn=*', true, function(err, users) {
            if(err) logger.crit('here');
            if(err) return res.status(500).json(err);

            var test = users.filter(function(u) {
                return u.sAMAccountName.toLowerCase().indexOf('j') == 0;
            });

            logger.debug(JSON.stringify(test, null, 4));
            res.status(200).json(auth);
        });        
    });
};

exports.gitlab = function(req, res, next) {
    var profile = req.body;

    var options = {
        criteria: { 'gitlab.id': profile.id },
        select: 'name email roles'
    };        

    User.load(options, function(err, user) {
        if(err) return res.status(500).json(err);
        if(!user) {
            user = new User({
                name: profile.name,
                email: profile.email,
                username: profile.username,
                provider: 'gitlab',
                gitlab: profile
            });

            user.roles.push('developer');

            user.save(function(err) {
                if(err) res.status(500).json(err);
                return res.status(200).json(buildAuthPkg(user));
            });
        } else {
            return res.status(200).json(buildAuthPkg(user));
        }
    });
};

// private functions

function buildAuthPkg(user) {
    var expires = moment().add(999, 'days').valueOf(),
        token = jwt.encode({
            iss: user._id,
            exp: expires
        }, "MUST_REPLACE_WITH_A_REAL_KEY");

    return {
        user: user,
        token: token,
        expires: expires
    };
}