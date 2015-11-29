(function() {

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

})();