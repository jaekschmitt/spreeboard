(function() {

    angular
        .module('main')
        .controller('loginController', loginController);

    loginController.$inject = ['$scope', '$location', 'authSvc'];

    function loginController($scope, $location, authSvc) {

        $scope.loginData = {
            email: '',
            password: ''
        };

        $scope.gitlabData = {
            email: '',
            password: ''
        };

        $scope.message = '';

        // functions

        $scope.login = login;
        $scope.devLogin = devLogin;

        function login() {

            authSvc.logIn($scope.loginData).then(function(response) {
                $location.path('/');
            }, function(err) {
                $scope.message = err;
            });

        };        

        function devLogin() {
            authSvc.devLogin(function(err, response) {
                if(err) {

                } else {
                    $location.path('/');
                }
            });
        }
    }

})();