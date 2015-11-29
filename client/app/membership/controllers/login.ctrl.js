(function() {

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

})();