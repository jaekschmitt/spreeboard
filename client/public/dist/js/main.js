angular.module('config', [])

.constant('env', {name:'development',api:'http://localhost:3000/',gitlab:{key:'f460f7500009f79ba2115fd74bd750b9076575a1c9081e36a873e1e8c67c24de',url:'http://docker.me:10080/',proxy:'http://localhost:3000/oauthproxy'}})

;;(function() {

    angular
        .module('main', ['config', 'ngRoute', 'ngSanitize', 'hc.marked', 'toastr', 'LocalStorageModule'])
        .config(httpConfig)
        .config(routeConfig)
        .config(markdownConfig)
        .config(gitlabConfig)
        .run(bootstrap);

    httpConfig.$inject = ['$httpProvider'];
    routeConfig.$inject = ['$routeProvider']; 
    markdownConfig.$inject = ['markedProvider'];
    gitlabConfig.$inject = ['env'];
    bootstrap.$inject = ['$window', 'authServices'];

    function httpConfig($httpProvider) {

        $httpProvider.interceptors.push('authInterceptor');
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;

        $httpProvider.defaults.headers.common.Accept = "application/json";
        $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

        delete $httpProvider.defaults.headers.common["X-Requested-With"];
    }

    function routeConfig($routeProvider) {

        // membership

        $routeProvider.when('/login', {
            controller: 'loginController',
            templateUrl: 'app/membership/views/login.html'
        });

        $routeProvider.when('/register', {
            controller: 'registerController',
            templateUrl: 'app/membership/views/register.html'
        });

        // boards

        $routeProvider.when('/boards', {
            controller: 'boardListController',
            templateUrl: 'app/boards/views/board-list.html'
        });

        $routeProvider.when('/boards/new', {
            controller: 'newBoardController',
            templateUrl: 'app/boards/views/board-new.html'
        });

        $routeProvider.when('/boards/:id', {
            controller: 'showBoardController',
            templateUrl: 'app/boards/views/board-show.html'
        });        

        $routeProvider.when('/boards/:board_id/settings', {
            controller: 'boardSettingsController',
            templateUrl: 'app/boards/views/board-settings.html'
        });

        $routeProvider.when('/boards/:board_id/backlog', {
            controller: 'boardBacklogController',
            templateUrl: 'app/boards/views/board-backlog.html'
        });

        // tasks

        $routeProvider.when('/tasks', {
            controller: 'taskListController',
            templateUrl: 'app/tasks/views/task-list.html'
        });

        $routeProvider.when('/boards/:board_id/tasks/new', {
            controller: 'newTaskController',
            templateUrl: 'app/tasks/views/task-new.html'
        });

        $routeProvider.when('/boards/:board_id/tasks/:task_id', {
            controller: 'showTaskController',
            templateUrl: 'app/tasks/views/task-show.html'
        });

        $routeProvider.when('/boards/:board_id/tasks/:task_id/edit', {
            controller: 'editTaskController',
            templateUrl: 'app/tasks/views/task-edit.html'
        });

    }

    function markdownConfig(markedProvider) {
        markedProvider.setRenderer({
            listitem: function(text) {
                var openedAt = text.indexOf('['),
                    closedAt = text.indexOf(']'),
                    checkedAt = text.indexOf('x');

                if(!(openedAt === 0 && closedAt === (openedAt + 2)))
                    return '<li>' + text + '</li>';                

                var checked = checkedAt > openedAt && closedAt > checkedAt;
                var listItem = '<li class="checkbox-list-item">'
                    + (checked ? '<input type="checkbox" checked disabled />' : '<input type="checkbox" disabled />')
                    + text.slice(closedAt + 1)
                    + '</li>';

                return listItem;                            
            },

            list: function(text, ordered) {
                var $text = $(text),
                    $checkbox = $text.find('input[type="checkbox"]'),
                    taskList = !!$checkbox.length;                

                return (taskList ? '<ul class="checkbox-list">' : '<ul>')
                    + text
                    + '</ul>';
            }
        });
    }

    function gitlabConfig(env) {
        hello.init({
            gitlab : {
                name : 'gitlab',                        
                oauth : {
                    version : 2,
                    auth: env.gitlab.url + 'oauth/authorize',
                    grant : env.gitlab.url + 'oauth/token',                
                    response_type: 'code'
                },
                
                scope: {
                    basic: ''
                },

                base: env.gitlab.url + 'api/v3/',

                get: {
                    me: 'user'
                }
            }
        });   
    }

    function bootstrap($window, authServices) {
        authServices.fillAuthData();

        if(!authServices.authentication.isAuth)
            $window.location.href = '/#/login';
    }

})();;(function() {

    angular
        .module('main')
        .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['$window', 'localStorageService'];

    function authInterceptor($window, localStorageSvc) {
        return {
            request: request,
            responseError: responseError
        };

        function request(config) {
            config.headers = config.headers || {};

            var authData = localStorageSvc.get('authData');
            if(authData) config.headers['x-auth-token'] = authData.token;

            return config;
        }

        function responseError(rejection) {
            if(rejection.status === 401) {
                $window.location.href = '/#/login';
            } else if(rejection.status === 403) {
                $window.location.href = '/#/'
            }
        }
    }

})();;(function() {

    angular
        .module('main')
        .factory('boardServices', boardServices);

    boardServices.$inject = ['$http', 'env'];

    function boardServices($http, env) {
        return {
            boards: boards,
            createBoard: createBoard,
            fetchBoard: fetchBoard,
            fetchBoardInfo: fetchBoardInfo,
            fetchBoardSettings: fetchBoardSettings,
            fetchBacklog: fetchBacklog,
            addBoardAttribute: addBoardAttribute,
            removeBoardAttribute: removeBoardAttribute
        };

        function boards(next) {
            return $http.get(env.api + 'boards')
            .success(function(boards) {
                next(null, boards);
            }).catch(next);
        }

        function createBoard(pkg, next) {
            return $http.post(env.api + 'boards', pkg)
            .success(function(board) {
                next(null, board);
            }).catch(next);
        }

        function fetchBoard(id, next) {
            $http.get(env.api + 'boards/' + id)
            .success(function(results) {
                next(null, results);
            }).catch(next);
        }

        function fetchBoardInfo(id, next) {
            $http.get(env.api + 'boards/' + id + '/info')
            .success(function(info) {
                next(null, info);
            }).catch(next);
        }

        function fetchBoardSettings(id, next) {
            $http.get(env.api + 'boards/' + id + '/settings')
            .then(success(next), error(next));
        }

        function fetchBacklog(id, next) {
            $http.get(env.api + 'boards/' + id + '/backlog')
            .then(success(next), error(next));
        }

        function addBoardAttribute(args, next) {
            $http.post(env.api + 'boards/' + args.board_id + '/' + args.type, { name: args.name })            
            .then(success(next), error(next));
        }

        function removeBoardAttribute(args, next) {
            $http.delete(env.api + 'boards/' + args.board_id + '/' + args.type + '/' + args.attrId)
            .then(success(next), error(next));   
        }

        // private functions

        function success(next) {
            return function(response) { next(null, response ? response.data : null); };
        }

        function error(next) {
            return function(response) { next(response.data); };
        }
    }

})();;(function() {

    angular
        .module('main')
        .factory('gitlabServices', gitlabServices);

    gitlabServices.$inject = ['$http', 'env'];

    function gitlabServices($http, env) {
        return {
            projects: projects
        };

        function projects(next) {
            $http.get(env.api + 'gitlab/projects')
            .success(function(projects) {
                next(null, projects);
            }).catch(next);
        }
    }
})();;(function() {

    angular
        .module('main')
        .factory('authServices', authService);


    authService.$inject = ['$http', '$q', 'localStorageService', 'env'];

    var authentication = {
            isAuth: false,
            user: {}
        };

    function authService($http, $q, localStorageSvc, env) {

        registerGitlabAuth();

        return {
            saveRegistration: saveRegistration,
            login: login,
            ldapLogin: ldapLogin,
            devLogin: devLogin,
            logout: logout,
            fillAuthData: fillAuthData,            
            hasRole: hasRole,
            authentication: authentication
        };      

        function registerGitlabAuth() {
            hello.init({
                'gitlab': env.gitlab.key
            }, {
                oauth_proxy: env.gitlab.proxy
            });
        }

        function saveRegistration(registration, next) {            
            $http.post(env.api + 'users', registration)
            .then(function(response) {
                var authData = saveAuthResponse(response);
                return next(null, authData);
            }).catch(next);
        }

        function login(loginData, next) {
            $http.post(env.api + 'users/session', loginData)
            .then(function(response) {
                var authData = saveAuthResponse(response);
                return next(null, authData);
            }, function(response) {
                next(response);
            });
        }

        function ldapLogin(pkg, next) {
            $http.post(env.api + 'users/session/ldap', pkg)
            .then(function(response) {
                if(!response) return next('Invalid username and password.');
                
                var authData = saveAuthResponse(response);
                next(null, authData);
            }, function(response) {
                next(response);
            });
        }

        function devLogin(next) {
            var gitlab = hello('gitlab');            

            gitlab.login().then(function(authPkg) {
                
                gitlab.api('me').then(function(profile) {
                    
                    $http.post(env.api + 'users/session/gitlab', profile)
                    .then(function(response) {
                        var authData = saveAuthResponse(response);
                        return next(null, authData);
                    })
                    .catch(function(err) {
                        logout();
                        return next(err);
                    });

                });                
            }, function() {
                debugger;
            });
        }

        function logout(next) {
            localStorageSvc.remove('authData');

            authentication.isAuth = false;
            authentication.user = null;

            next(null);
        }    

        function fillAuthData() {

            var authData = localStorageSvc.get('authData');
            if(authData) {
                authentication.isAuth = true;
                authentication.user = authData.user;                
            }
        }

        function hasRole(role) {
            if(!authentication || !authentication.user) return false;

            var roles = authentication.user.roles;
            return roles.indexOf(role) > -1;
        }

        // private functions
        function saveAuthResponse(response) {
            var authData = {
                token: response.data.token,
                expires: response.data.expires,
                user: response.data.user
            };

            localStorageSvc.set('authData', authData);
            fillAuthData();

            return authData;
        }
    }

})();;(function() {

    angular
        .module('main')
        .factory('userServices', userServices);

    userServices.$inject = ['$http', 'env'];

    function userServices($http, env) {
        return {
            list: list
        };

        function list(search, next) {
            var url = env.api + 'users',
                isSearch = typeof search !== 'function',
                cb =  isSearch ? next : search;

            if(isSearch) url += '?' + search;
            $http.get(url).then(success(cb), error(cb));
        }
    }

    // private functions

    function success(next) {
        return function(response) { next(null, response ? response.data : null); };
    }

    function error(next) {
        return function(response) { next(response.data); };
    }

})();;(function() {

    angular
        .module('main')
        .factory('taskServices', taskServices);

    taskServices.$inject = ['$http', 'env'];

    function taskServices($http, env) {
        return {            
            createTask: createTask,
            fetchTask: fetchTask,
            searchTasks: searchTasks,
            updateTask: updateTask,
            completeTask: completeTask,
            deleteTask: deleteTask
        };

        function createTask(pkg, next) {
            $http.post(env.api + 'boards/' + pkg.boardId + '/tasks', pkg)
            .then(success(next), error(next));
        }

        function fetchTask(id, next) {
            $http.get(env.api + 'tasks/' + id)
            .then(success(next), error(next));
        }

        function searchTasks(params, next) {
            $http.get(env.api + 'tasks/search', { params: params })
            .then(success(next), error(next));
        }

        function updateTask(pkg, next) {
            $http.put(env.api + 'tasks/' + pkg._id, pkg)
            .then(success(next), error(next));
        }

        function completeTask(id, next) {
            $http.put(env.api + 'tasks/' + id + '/complete')
            .then(success(next), error(next));
        }

        function deleteTask(id, next) {
            $http.delete(env.api + 'tasks/' + id)
            .then(success(next), error(next));
        }

        // private functions

        function success(next) {
            return function(response) { next(null, response ? response.data : null); };
        }

        function error(next) {
            return function(response) { next(response.data); };
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('boardBacklogController', boardBacklogController);

    boardBacklogController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'boardServices', 'taskServices', 'authServices'];

    function boardBacklogController($scope, $routeParams, $location, toastr, _boards, _tasks, _auth) {

        // properties 

        $scope.info = {};
        $scope.board = {};
        $scope.tasks = {};

        $scope.isDeveloper = _auth.hasRole('developer');
        $scope.isOwner = _auth.hasRole('owner');

        // functions

        $scope.approve = approve;

        activate();

        function activate() {
            var board_id = $routeParams.board_id;

            _boards.fetchBacklog(board_id, function(err, backlog) {
                if(err) return toastr.error(err);

                var tasks = backlog.tasks;
                delete backlog.tasks;

                $scope.board = backlog.board;
                $scope.tasks = {
                    approved: _.where(tasks, { approved: true }),
                    notApproved: _.where(tasks, { approved: false })
                };
            });
        }

        function approve(task) {
            var pkg = {
                _id: task._id,
                approved: true
            };

            _tasks.updateTask(pkg, function(err, response) {
                if(err) return toastr.error(err);

                var idx = $scope.tasks.notApproved.indexOf(task);
                $scope.tasks.notApproved.splice(idx, 1);
                $scope.tasks.approved.push(task);
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('boardListController', boardListController);

    boardListController.$inject = ['$scope', 'toastr', 'authServices', 'boardServices'];

    function boardListController($scope, toastr, authServices, boardServices) {

        // properties

        $scope.boards = [];
        $scope.roles = authServices.authentication.user.roles;

        // functions

        activate();

        function activate() {
            boardServices.boards(function(err, boards) {
                if(err) return toastr.error(err);
                $scope.boards = boards;
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('newBoardController', newBoardController);

    newBoardController.$inject = ['$scope', '$location', 'toastr', 'boardServices', 'gitlabServices'];

    function newBoardController($scope, $location, toastr, boardServices, gitlabServices) {

        // properties

        $scope.board = {};
        $scope.projects = [];
        $scope.stages = [];

        // function

        $scope.addStage = addStage;
        $scope.removeStage = removeStage;
        $scope.createBoard = createBoard;

        activate();

        function activate() {
            gitlabServices.projects(function(err, projects) {
                $scope.projects = projects;
            });

            $('[data-toggle="tooltip"]').tooltip()
        }

        function addStage(stage) {
            if(!stage) return;
            if($scope.stages.indexOf(stage) >= 0) 
                return;

            $scope.stages.push(stage);
            $scope.stage = '';
        }

        function removeStage(stage) {
            var idx = $scope.stages.indexOf(stage);
            if(idx >= 0) $scope.stages.splice(idx, 1);                
        }

        function createBoard() {
            var pkg = $scope.board;
            pkg.stages = $scope.stages;

            console.log(pkg);
            boardServices.createBoard(pkg, function(err, board) {
                $location.path('/boards/' + board._id);
            });
        }

    }

})();;(function() {

    angular
        .module('main')
        .controller('boardSettingsController', boardSettingsController);

    boardSettingsController.$inject = ['$scope', '$routeParams', 'toastr', 'boardServices'];

    function boardSettingsController($scope, $routeParams, toastr, _boards) {

        // properties

        $scope.board = {};

        // functions

        $scope.addPriority = addPriority;        
        $scope.removePriority = removePriority;
        $scope.addSize = addSize;        
        $scope.removeSize = removeSize;        

        activate();

        function activate() {
            var board_id = $routeParams.board_id;

            _boards.fetchBoardSettings(board_id, function(err, board) {
                if(err) return toastr.error(err);
                $scope.board = _.extend({ priorities: [], sizes: [] }, board);
            });
        }

        function addPriority(p) {
            if(!p || _.findWhere($scope.board.priorities, { name: p })) return;
            
            _boards.addBoardAttribute({
                board_id: $scope.board._id,
                type: 'priority',
                name: p
            }, function(err, attr) {                
                if(err) return toastr.error(err);

                $scope.board.priorities.push({ name: p, _id: attr._id });
                $scope.priority = '';
            });            
        }

        function removePriority(p) {
            var idx = $scope.board.priorities.indexOf(p);
            
            if(idx > -1) {
                _boards.removeBoardAttribute({
                    board_id: $scope.board._id,
                    type: 'priority',
                    attrId: p._id
                }, function(err, attr) {
                    if(err) return toastr.error(err);
                    $scope.board.priorities.splice(idx, 1);
                });                
            }
        }

        function addSize(s) {
            if(!s || _.findWhere($scope.board.sizes, { name: s })) return;
            
            _boards.addBoardAttribute({
                board_id: $scope.board._id,
                type: 'size',
                name: s
            }, function(err, attr) {                
                if(err) return toastr.error(err);

                $scope.board.sizes.push({ name: s, _id: attr._id });
                $scope.size = '';
            });            
        }

        function removeSize(s) {
            var idx = $scope.board.sizes.indexOf(s);
            
            if(idx > -1) {
                _boards.removeBoardAttribute({
                    board_id: $scope.board._id,
                    type: 'size',
                    attrId: s._id
                }, function(err, attr) {
                    if(err) return toastr.error(err);
                    $scope.board.sizes.splice(idx, 1);
                });                
            }
        }

    }

})();;(function() {

    angular
        .module('main')
        .controller('showBoardController', showBoardController);

    showBoardController.$inject = ['$scope', '$routeParams', 'toastr', 'authServices', 'boardServices'];

    function showBoardController($scope, $routeParams, toastr, authServices, boardServices) {

        // properties

        var roles = authServices.authentication.user.roles;
        
        $scope.isAdmin = roles.indexOf('admin') > -1;
        $scope.isOwner = roles.indexOf('owner') > -1;

        $scope.boards = [];
        $scope.backlog = null;

        // functions

        activate();

        function activate() {
            var boardId = $routeParams.id;

            boardServices.fetchBoard(boardId, function(err, results) {
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.backlog = results.backlog;                
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('mainController', mainController);

    mainController.$inject = ['$scope', '$location', 'authServices'];

    function mainController($scope, $location, authServices) {

        // properties

        $scope.auth = authServices.authentication

        // functions

        $scope.logout = logout;

        function logout() {
            authServices.logout(function(err) {
                $location.path('/login');
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('loginController', loginController);

    loginController.$inject = ['$scope', '$location', 'toastr', 'authServices'];

    function loginController($scope, $location, toastr, authServices) {

        $scope.loginData = {
            email: '',
            password: ''
        };

        $scope.message = '';

        // functions

        $scope.login = login;
        $scope.ldapLogin = ldapLogin;
        $scope.devLogin = devLogin;

        function login() {
            authServices.login($scope.loginData, function(response) {
                $location.path('/');
            }, function(err) {
                $scope.message = err;
            });

        };        

        function ldapLogin() {
            authServices.ldapLogin($scope.loginData, function(err, response) {
                if(err) return toastr.error(err);
                $location.path('/');
            });
        }

        function devLogin() {
            authServices.devLogin(function(err, response) {
                if(err) return toastr.error(error);
                $location.path('/');
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('registerController', registerController);

    registerController.$inject = ['$scope', '$location', 'toastr', 'authServices'];

    function registerController($scope, $location, toastr, authServices) {

        // properties

        $scope.regData = {
            name: '',
            email: '',
            password: ''
        };

        // functions

        $scope.register = register;

        function register() {
            var pkg = $scope.regData;

            authServices.saveRegistration(pkg, function(err, response) {
                if(err) return toastr.error(err);
                $location.path('/');
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('editTaskController', editTaskController);

    editTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices', 'userServices', 'authServices'];

    function editTaskController($scope, $routeParams, $location, toastr, _tasks, _boards, _users, _auth) {

        // properties

        $scope.board = {};
        $scope.users = [];
        $scope.task = {};        

        $scope.isDeveloper = _auth.hasRole('developer');
        $scope.isOwner = _auth.hasRole('owner');

        // functions

        $scope.update = updateTask;
        $scope.delete = deleteTask;        

        activate();

        function activate() {
            var board_id = $routeParams.board_id,
                task_id = $routeParams.task_id;

            async.parallel({
                board: function(cb) { return _boards.fetchBoardInfo(board_id, cb); },
                task: function(cb) { return _tasks.fetchTask(task_id, cb); },
                users: function(cb) {return _users.list('role=owner', cb); }
            }, function(err, results) {
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.users = results.users || [];
                $scope.task = results.task;                
            });
        }

        function updateTask() {
            if($scope.working) return;

            var pkg = $scope.task;

            if(pkg.developer) pkg.developer = pkg.developer._id;
            if(pkg.owner) pkg.owner = pkg.owner._id;

            $scope.working = true;

            _tasks.updateTask(pkg, function(err) {
                $scope.working = false;

                if(err) return toastr.error(err);

                toastr.success('Task updated!');
                $location.path('/boards/' + $scope.board._id);
            });          
        }

        function deleteTask() {            
            if($scope.working) return;
            $scope.working = true;

            _tasks.deleteTask($scope.task._id, function(err) {
                $scope.working = false;

                if(err) return toastr.error(err);
                $location.path('/boards/' + $scope.board._id);
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('taskListController', taskListController);

    taskListController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'localStorageService', 'authServices', 'taskServices', 'boardServices', 'userServices'];

    var STORAGE_KEY = 'task-list.filters';

    function taskListController($scope, $routeParams, $location, toastr, _storage, _auth, _tasks, _boards, _users) {

        // properties

        var roles = _auth.authentication.user.roles;
        
        $scope.isAdmin = roles.indexOf('admin') > -1;
        $scope.isOwner = roles.indexOf('owner') > -1;

        $scope.tasks = [];

        $scope.filters = {
            boards: [],            
            statuses: [],
            stages: [],
            priorities: [],
            sizes: [],
            developers: [],
            owners: []
        };

        $scope.counts = {            

        };

        // functions

        $scope.applyFilters = applyFilters;
        $scope.clearFilters = clearFilters;
        $scope.getAttrColor = getAttrColor;

        activate();

        function activate() {
            async.parallel({
                boards: function(cb) { _boards.boards(cb); },
                users: function(cb) { _users.list(cb); }
            }, function(err, results) {                
                var boards = results.boards,
                    users = results.users,
                    filters = {};

                filters.boards = boards.map(function(b) { return { _id: b._id, name: b.name }; });

                filters.stages = _.chain(boards)
                                .pluck('stages')
                                .flatten()
                                .pluck('name')
                                .uniq()
                                .value();

                filters.priorities = _.chain(boards)
                                    .pluck('priorities')
                                    .flatten()          
                                    .pluck('name')
                                    .uniq()
                                    .value();

                filters.sizes = _.chain(boards)
                                .pluck('sizes')
                                .flatten()
                                .pluck('name')
                                .uniq()
                                .value();
                
                filters.developers = users.filter(function(u) { return u.roles.indexOf('developer') > -1; });
                filters.owners = users.filter(function(u) { return u.roles.indexOf('owner') > -1; });

                var prevFilters = _storage.get(STORAGE_KEY);
                filters = _.extend(filters, prevFilters);                

                setupFilters(filters);

                $scope.filters = filters;
                applyFilters();
            });
        }
        
        function applyFilters() {
            var filters = $scope.filters,
                params = {
                    board: filters.board ? filters.board._id : undefined,
                    status: filters.status,
                    size: filters.size,
                    priority: filters.priority,
                    stage: filters.stage
                };            

            _storage.set(STORAGE_KEY, params);
            
            _tasks.searchTasks(params, function(err, results) {
                gatherCounts(results, filters);
                $scope.tasks = results;                
            });
        }        

        function clearFilters() {
            console.log('clearing filters');

            $('.task-filters').collapse('hide');

            delete $scope.filters.board;
            delete $scope.filters.status;
            delete $scope.filters.size;
            delete $scope.filters.priority;
            delete $scope.filters.stage;

            applyFilters();
        }


        // TODO: rework this so it pulls from the server please
        function getAttrColor(attr) {
            switch(attr) {
                case 'sizes':
                    return 'rgb(2, 90, 165)';
                case 'priorities':
                    return 'rgb(240, 173, 78)';
                case 'stages':
                    return 'rgb(92, 184, 92)';
                default: 
                    return '#ccc';
            }   
        }

        // private functions

        function setupFilters(filters) {
            var isFiltered = filters.board
                                || filters.status
                                || filters.size
                                || filters.priority
                                || filters.stage;

            if(isFiltered) {
                console.log('found filters');
                $('.task-filters').addClass('in');
            }
        }

        function gatherCounts(tasks, filters) {
            console.log('gathering counts');

            var counts = {
                sizes: countAttribute('size', filters.sizes, tasks),
                priorities: countAttribute('priority', filters.priorities, tasks),
                stages: countAttribute('stage', filters.stages, tasks)
            };
            
            console.log(counts);

            return $scope.counts = counts;
        }

        function countAttribute(attrName, attrList, tasks) {
            var count = {};
                        
            attrList.forEach(function(attr) {
                count[attr] = tasks.filter(function(t) { return !!t[attrName] && t[attrName].name === attr; }).length;
            });

            return count;
        };

    }

})();;(function() {

    angular
        .module('main')
        .controller('newTaskController', newTaskController);

    newTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices', 'userServices', 'authServices'];

    function newTaskController($scope, $routeParams, $location, toastr, _tasks, _boards, _users, _auth) {

        // properties

        $scope.board = {};
        $scope.users = {};
        $scope.task = {};

        $scope.isDeveloper = _auth.hasRole('developer');
        $scope.isOwner = _auth.hasRole('owner');

        $scope.working = false;

        // functions

        $scope.createTask = createTask;

        activate();

        function activate() {
            var board_id = $routeParams.board_id;

            async.parallel({
                board: function(cb) { return _boards.fetchBoardInfo(board_id, cb); },
                users: function(cb) { return _users.list(cb); }
            }, function(err, results){ 
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.users = results.users;
            });
        }

        function createTask() {
            if($scope.working) return;
            
            var task = $scope.task;
            var pkg = {
                title: task.title,
                description: task.description,
                stage: task.stage,
                priority: task.priority,
                size: task.size,
                developer: task.developer ? task.developer._id : null,
                owner: task.owner ? task.owner._id : null,
                boardId: $scope.board._id
            };            

            $scope.working = true;
            _tasks.createTask(pkg, function(err, task) {                
                $scope.working = false;

                if(err) {
                    toastr.error(err);
                } else {
                    $location.path('/boards/' + pkg.boardId);                    
                }                
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .controller('showTaskController', showTaskController);

    showTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices', 'userServices', 'authServices'];

    function showTaskController($scope, $routeParams, $location, toastr, _tasks, _boards, _users, _auth) {

        // properties

        $scope.task = {};

        $scope.taskLink = '#';
        $scope.isDeveloper = _auth.authentication.user.roles.indexOf('developer') > -1;

        // functions

        $scope.complete = complete;

        activate();

        function activate() {
            var task_id = $routeParams.task_id;

            _tasks.fetchTask(task_id, function(err, task) {
                if(err) return toastr.error(err);
                $scope.task = task;
            });
        }

        function complete() {
            var task_id = $scope.task._id;

            _tasks.completeTask(task_id, function(err, task) {
                if(err) return toastr.error(err);
                $location.path('/boards/' + $scope.task.board);
            });
        }
    }

})();;(function() {

    angular
        .module('main')
        .filter('cut', cut);

    function cut() {
        return function(value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        }
    }

})();;(function() {

    angular
        .module('main')
        .filter('stripMarkdown', stripMarkdown);

    function stripMarkdown() {
        return function(value) {
            var output = value;

            try {

                output = output
                    // Remove HTML tags
                    .replace(/<(.*?)>/g, '$1')
                    // Remove setext-style headers
                    .replace(/^[=\-]{2,}\s*$/g, '')
                    // Remove footnotes?
                    .replace(/\[\^.+?\](\: .*?$)?/g, '')
                    .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
                    // Remove images
                    .replace(/\!\[.*?\][\[\(].*?[\]\)]/g, '')
                    // Remove inline links
                    .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
                    // Remove reference-style links?
                    .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
                    // Remove atx-style headers
                    .replace(/^\#{1,6}\s*([^#]*)\s*(\#{1,6})?/gm, '$1')
                    .replace(/([\*_]{1,2})(\S.*?\S)\1/g, '$2')
                    .replace(/(`{3,})(.*?)\1/gm, '$2')
                    .replace(/^-{3,}\s*$/g, '')
                    .replace(/`(.+?)`/g, '$1')
                    .replace(/\n{2,}/g, '\n\n')
                    .replace('- [ ]', '')
                    .replace('- [x]', '');
            } catch(e) {
                console.error(e);
                return value;
            }

            return output;
        }
    }

})();;(function() {

    angular
        .module('main')
        .directive('taskList', taskList);

    function taskList() {
        return {
            restrict: 'E',
            scope: {
                tasks: '=tasks',
                editable: '=editable'
            },
            templateUrl: 'app/tasks/directives/task-list-tmpl.html',            
        }
    }

})();
//# sourceMappingURL=main.js.map