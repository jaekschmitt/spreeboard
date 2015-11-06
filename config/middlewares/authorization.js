var logger = require(__base + 'config/logger'),
    _ = require('lodash');

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next()
  if (req.method == 'GET') req.session.returnTo = req.originalUrl
  res.redirect('/login')
};

exports.requiresRoles = function(roles) {
    return function(roles, req, res, next) {
        if(!req.user) res.redirect('/');

        roles = _.flatten([roles]);    
        roles.forEach(function(r) {
            if(req.user.roles.indexOf(r) < 0) return res.redirect('/');
        });

        next();
    }.bind(undefined, Array.prototype.slice.call(arguments));
}
