(function() {

    angular
        .module('main')
        .controller('mainController', mainController);

    mainController.$inject = ['$scope', '$location', 'authSvc'];

    function mainController($scope, $location, authSvc) {

        // properties

        $scope.auth = authSvc.authentication

        // functions

        $scope.logout = logout;

        function logout() {
            authSvc.logout(function(err) {
                $location.path('/login');
            });
        }
    }

})();