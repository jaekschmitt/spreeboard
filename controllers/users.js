var logger = require('../config/logger'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.login = function(req, res, next) {
    res.render('users/login');
};

exports.logout = function(req, res, next) {
    req.logout();
    res.redirect('/login');
};

exports.register = function(req, res, next) {
    res.render('users/register');
};

exports.create = function(req, res, next) {
    var user = new User(req.body);
    user.provider = 'local';
    user.save(function(err) {
        if(err) {
            res.render('users/register');
        }

        req.logIn(user, function(err) {
            if(err) {
                logger.crit('unable to log in user after creation.');
            }

            return res.redirect('/');
        });
    });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

exports.signin = function(req, res) {};

exports.authCallback = login;
exports.session = login;

// private methods

function login(req, res) {
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
}