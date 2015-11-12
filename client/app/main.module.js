(function() {

    angular
        .module('main', ['ngRoute', 'toastr', 'LocalStorageModule'])
        .config(httpConfig)
        .config(routeConfig)
        .run(bootstrap);

    httpConfig.$inject = ['$httpProvider'];
    routeConfig.$inject = ['$routeProvider']; 
    bootstrap.$inject = ['$window', 'authSvc'];

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

        // tasks

        $routeProvider.when('/:board_name/:board_id/tasks/new', {
            controller: 'newTaskController',
            templateUrl: 'app/tasks/views/task-new.html'
        });        

    }

    function bootstrap($window, authSvc) {
        authSvc.fillAuthData();

        if(!authSvc.authentication.isAuth)
            $window.location.href = '/#/login';
    }

})();