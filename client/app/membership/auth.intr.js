(function() {

    angular
        .module('main')
        .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['$window', 'localStorageService'];

    function authInterceptor($window, localStorageSvc) {
        return {
            request: request,
            responseError, responseError
        };

        function request(config) {
            config.headers = config.headers || {};

            var authData = localStorageSvc.get('authData');
            if(authData) config.headers['x-auth-token'] = authData.token;

            return config;
        }

        function responseError(rejection) {
            if(rejection.status === 401) {
                $window.location.href = '/#/login';
            } else if(rejection.status === 403) {
                $window.location.href = '/#/'
            }
        }
    }

})();