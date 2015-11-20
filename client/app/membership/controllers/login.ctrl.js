(function() {

    angular
        .module('main')
        .controller('loginController', loginController);

    loginController.$inject = ['$scope', '$location', 'toastr', 'authSvc'];

    function loginController($scope, $location, toastr, authSvc) {

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
            authSvc.login($scope.loginData, function(response) {
                $location.path('/');
            }, function(err) {
                $scope.message = err;
            });

        };        

        function ldapLogin() {
            authSvc.ldapLogin($scope.loginData, function(err, response) {
                if(err) return toastr.error(err);
                $location.path('/');
            });
        }

        function devLogin() {
            authSvc.devLogin(function(err, response) {
                if(err) return toastr.error(error);
                $location.path('/');
            });
        }
    }

})();