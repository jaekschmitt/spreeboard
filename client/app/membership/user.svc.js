(function() {

    var env = {
        api: 'http://localhost:3000/'
    };

    angular
        .module('main')
        .factory('userServices', userServices);

    userServices.$inject = ['$http'];

    function userServices($http) {
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