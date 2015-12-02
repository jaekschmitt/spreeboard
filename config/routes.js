var logger = require('./logger'),
    controllers = require(__base + 'controllers');

var _boards = controllers.boards,
    projects = controllers.projects,
    tasks = controllers.tasks,
    gitlab = controllers.gitlab,
    users = controllers.users;

var membership = require(__base + 'controllers/membership');

var authorization = require('./middlewares/authorization'),
    auth = authorization.requiresLogin,
    roles = authorization.requiresRoles;

module.exports = function(app, passport) {

    // return base index page to load spa
    app.get('/', function(req, res) { 
        res.render('index');
    });

    // Users
    app.get('/users', auth, users.list);
    app.post('/users', membership.register);
    app.post('/users/session', membership.signIn);
    app.post('/users/session/ldap', membership.ldap, membership.signIn);
    app.post('/users/session/gitlab', membership.gitlab);
    
    // Boards
    app.param('board_id', _boards.load);    
    app.get('/boards', auth, _boards.list);
    app.post('/boards', auth, _boards.create);
    app.get('/boards/:id', auth, _boards.show);
    app.get('/boards/:board_id/info', auth, _boards.info);
    app.get('/boards/:board_id/backlog', auth, _boards.backlog);
    app.get('/boards/:board_id/settings', auth, _boards.settings);
    
    // Tasks
    app.param('task_id', tasks.load);
    app.get('/tasks/:task_id', auth, tasks.show);
    app.post('/boards/:board_id/tasks', auth, roles('developer', 'owner'), tasks.create);
    app.put('/tasks/:task_id', auth, roles('developer', 'owner'), tasks.update);
    app.delete('/tasks/:task_id', auth, roles('developer', 'owner'), tasks.delete);

    // Board Attributes
    app.post('/boards/:board_id/:type', auth, _boards.addBoardAttr);    
    app.delete('/boards/:board_id/:type/:id', auth, _boards.deleteBoardAttr);

    // Gitlab
    app.get('/gitlab/projects', auth, roles('developer'), gitlab.projects);
    app.post('/gitlab/issues', gitlab.issuesSync);
    app.post('/gitlab/merges', gitlab.mergeSync);
};