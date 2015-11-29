(function() {

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

})();