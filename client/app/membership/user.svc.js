(function() {

    angular
        .module('main')
        .factory('userServices', userServices);

    userServices.$inject = ['$http', 'env'];

    function userServices($http, env) {
        return {
            list: list
        };

        function list(next) {
            $http.get(env.api + 'users')
            .then(success(next), error(next));
        }
    }

    // private functions

    function success(next) {
        return function(response) { next(null, response ? response.data : null); };
    }

    function error(next) {
        return function(response) { next(response.data); };
    }

})();