var logger = require('../logger'),
    mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    User = mongoose.model('User');

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    var options = {
      criteria: { email: email },
      select: 'name email hashed_password salt'
    };

    logger.debug('authenticating local user.');

    User.load(options, function (err, user) {
      if (err) return done(err)
      if (!user) {
        return done(null, false, req.flash({ message: 'Unknown user' }));
      }
      if (!user.authenticate(password)) {
        return done(null, false, req.flash({ message: 'Invalid password' }));
      }
      return done(null, user);
    });
  }
);