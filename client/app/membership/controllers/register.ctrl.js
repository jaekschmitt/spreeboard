(function() {

    angular
        .module('main')
        .controller('registerController', registerController);

    registerController.$inject = ['$scope', '$location', 'toastr', 'authSvc'];

    function registerController($scope, $location, toastr, authSvc) {

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

            authSvc.saveRegistration(pkg, function(err, response) {
                if(err) return toastr.error(err);
                $location.path('/');
            });
        }
    }

})();