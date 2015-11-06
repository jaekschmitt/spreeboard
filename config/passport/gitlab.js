var mongoose = require('mongoose'),
    logger = require('../logger'),
    GitlabStrategy = require('passport-gitlab').Strategy,
    config = require('../config'),
    User = mongoose.model('User');

module.exports = new GitlabStrategy({
    clientID: config.gitlab.key,
    clientSecret: config.gitlab.secret,
    gitlabURL: config.gitlab.url,
    callbackURL: config.gitlab.callbackUrl
},
function(accessToken, refreshToken, profile, done) {
    var options = {
        criteria: { 'gitlab.id': profile.id }
    };
    User.load(options, function (err, user) {
        if (err) return done(err);
        if (!user) {
            logger.debug(JSON.stringify(profile, null, 4));
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                username: profile.username,
                provider: 'gitlab',
                gitlab: profile._json
            });

            // user is a developer, add the role
            user.roles.push('developer');

            user.save(function (err) {
                if (err) console.log(err);
                return done(err, user);
            });
        } else {
            return done(err, user);
        }
    });
}
);