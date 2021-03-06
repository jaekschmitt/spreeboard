(function() {

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
            },

            image: function(src, rel, type) {
                return '<img class="col-xs-12" src="' + src + '"></img>';
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

})();