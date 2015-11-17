var logger = require('./logger'),
    controllers = require(__base + 'controllers');

var boards = controllers.boards,
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
    app.post('/users/session/gitlab', membership.gitlab);
    
    // Boards
    app.param('board_id', boards.load);    
    app.get('/boards', auth, boards.list);
    app.post('/boards', auth, boards.create);
    app.get('/boards/:id', auth, boards.show);
    app.get('/boards/:board_id/info', auth, boards.info);

    // Tasks
    app.param('task_id', tasks.load);
    app.get('/tasks/:task_id', auth, tasks.show);
    app.post('/boards/:board_id/tasks', auth, roles('developer'), tasks.create);
    app.put('/tasks/:task_id', auth, roles('developer'), tasks.update);
    app.delete('/tasks/:task_id', auth, roles('developer'), tasks.delete);

    // Gitlab
    app.get('/gitlab/projects', auth, roles('developer'), gitlab.projects);
    app.post('/gitlab/issues', gitlab.issuesSync);
};