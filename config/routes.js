var logger = require('./logger'),
    controllers = require(__base + 'controllers');

var boards = controllers.boards,
    projects = controllers.projects,
    users = controllers.users;

var authorization = require('./middlewares/authorization'),
    authed = authorization.requiresLogin,
    roles = authorization.requiresRoles;

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
    app.get('/boards/new', authed, roles('admin'), boards.new);
    app.get('/boards/:id', boards.show);
    app.get('/boards', authed, boards.list);
    app.post('/boards', authed, boards.create);
    app.put('/boards/:id', boards.update);
    app.delete('/boards/:id', boards.delete);

    // Projects
    app.get('/projects/new', projects.new);

};