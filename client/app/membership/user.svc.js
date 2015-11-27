(function() {

    angular
        .module('main')
        .factory('userServices', userServices);

    userServices.$inject = ['$http', 'env'];

    function userServices($http, env) {
        return {
            list: list
        };

        function list(search, next) {
            var url = env.api + 'users',
                isSearch = typeof search !== 'function',
                cb =  isSearch ? next : search;

            if(isSearch) url += '?' + search;
            $http.get(url).then(success(cb), error(cb));
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