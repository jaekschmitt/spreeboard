(function() {

    angular
        .module('main')
        .controller('registerController', registerController);

    registerController.$inject = ['$scope', 'authSvc'];

    function registerController($scope, authSvc) {

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
                if(err) {

                }

                console.log(response);
            });
        }
    }

})();