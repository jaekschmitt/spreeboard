var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    jwt = require('jwt-simple'),
    _ = require('lodash'),
    ActiveDirectory = require('activedirectory'),
    moment = require('moment'),
    db = require(__base + 'config/mongoose-db');

exports.register = function(req, res, next) {
    var user = new db.User(req.body);
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

    logger.debug('Falling back to basic signin.');

    db.User.load(options, function(err, user) {    
        if (err) return res.status(500).json(err);
        if (!user) return res.status(401).json(new Error('Unknown username'));
        if (!user.authenticate(req.body.password)) return res.status(401).json(new Error('Invalid password'));
    
        return res.status(200).json(buildAuthPkg(user));
    });
};

exports.ldap = function(req, res, next) {
    var ad = new ActiveDirectory(config.active_directory),
        username = req.body.email,
        usernameDN = req.body.email + '@' + config.active_directory.domain,
        password = req.body.password;

    logger.debug('Attempting LDAP login.');

    ad.authenticate(usernameDN, password, function(err, auth) {        
        if(err) return next();
        
        var userLdap = new ActiveDirectory({
            url: config.active_directory.url,
            baseDN: config.active_directory.baseDN,
            username: usernameDN,
            password: password
        });

        userLdap.findUser(username, true, function(err, ldapUser) {
            if(err) logger.crit(err);
            if(err) return res.status(500).json(err);

            var options = {
                criteria: { 'ldap.sAMAccountName' : ldapUser.sAMAccountName },
                select: 'name email roles'
            };        

            db.User.load(options, function(err, user) {
                if(err) return res.status(500).json(err);

                if(!user) {
                    user = new db.User({
                        name: ldapUser.displayName,
                        email: ldapUser.mail,
                        username: ldapUser.sAMAccountName,
                        provider: 'ldap'
                    });

                    delete ldapUser['groups'];
                    user.ldap = ldapUser;
                    
                    logger.crit('here');
                    user.save(function(err) {
                        if(err) res.status(500).json(err);
                        return res.status(200).json(buildAuthPkg(user));
                    });
                } else {
                    logger.crit('there');
                    return res.status(200).json(buildAuthPkg(user));
                }
            })            
        });        
    });
};

exports.gitlab = function(req, res, next) {
    var profile = req.body;

    var options = {
        criteria: { 'gitlab.id': profile.id },
        select: 'name email roles'
    };        

    db.User.load(options, function(err, user) {
        if(err) return res.status(500).json(err);
        if(!user) {
            user = new db.User({
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