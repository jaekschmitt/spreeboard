var logger = require('./logger'),
    controllers = require(__base + 'controllers');

var boards = controllers.boards,
    users = controllers.users;

var authorization = require('./middlewares/authorization'),
    authed = authorization.requiresLogin;

module.exports = function(app, passport) {

    // return base index page to load spa
    app.get('/', authed, function(req, res) { 
        res.render('index'); 
    });

    // Users
    app.get('/login', users.login);
    app.get('/logout', users.logout);
    app.get('/register', users.register);
    app.post('/users', users.create);
    app.post('/users/session', passport.authenticate('local',{
        failureRedirect: '/login',
        failureFlash: true
    }), users.session);
    app.get('/auth/gitlab', passport.authenticate('gitlab', {
        failureRedirect: '/login'
    }), users.signin);
    app.get('/auth/gitlab/callback', passport.authenticate('gitlab', {
        failureRedirect: '/login'
    }), users.authCallback);

    // Boards
app.get('/boards/new', boards.new);
    app.get('/boards/:id', boards.show);
    app.get('/boards', boards.list);
    
    app.put('/boards/:id', boards.update);
    app.delete('/boards/:id', boards.delete);

};