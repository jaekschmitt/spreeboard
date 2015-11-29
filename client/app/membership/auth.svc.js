(function() {

    angular
        .module('main')
        .factory('authServices', authService);


    authService.$inject = ['$http', '$q', 'localStorageService', 'env'];

    var authentication = {
            isAuth: false,
            user: {}
        };

    function authService($http, $q, localStorageSvc, env) {

        registerGitlabAuth();

        return {
            saveRegistration: saveRegistration,
            login: login,
            ldapLogin: ldapLogin,
            devLogin: devLogin,
            logout: logout,
            fillAuthData: fillAuthData,            
            hasRole: hasRole,
            authentication: authentication
        };      

        function registerGitlabAuth() {
            hello.init({
                'gitlab': env.gitlab.key
            }, {
                oauth_proxy: env.gitlab.proxy
            });
        }

        function saveRegistration(registration, next) {            
            $http.post(env.api + 'users', registration)
            .then(function(response) {
                var authData = saveAuthResponse(response);
                return next(null, authData);
            }).catch(next);
        }

        function login(loginData, next) {
            $http.post(env.api + 'users/session', loginData)
            .then(function(response) {
                var authData = saveAuthResponse(response);
                return next(null, authData);
            }, function(response) {
                next(response);
            });
        }

        function ldapLogin(pkg, next) {
            $http.post(env.api + 'users/session/ldap', pkg)
            .then(function(response) {
                if(!response) return next('Invalid username and password.');
                
                var authData = saveAuthResponse(response);
                next(null, authData);
            }, function(response) {
                next(response);
            });
        }

        function devLogin(next) {
            var gitlab = hello('gitlab');            

            gitlab.login().then(function(authPkg) {
                
                gitlab.api('me').then(function(profile) {
                    
                    $http.post(env.api + 'users/session/gitlab', profile)
                    .then(function(response) {
                        var authData = saveAuthResponse(response);
                        return next(null, authData);
                    })
                    .catch(function(err) {
                        logout();
                        return next(err);
                    });

                });                
            }, function() {
                debugger;
            });
        }

        function logout(next) {
            localStorageSvc.remove('authData');

            authentication.isAuth = false;
            authentication.user = null;

            next(null);
        }    

        function fillAuthData() {

            var authData = localStorageSvc.get('authData');
            if(authData) {
                authentication.isAuth = true;
                authentication.user = authData.user;                
            }
        }

        function hasRole(role) {
            if(!authentication || !authentication.user) return false;

            var roles = authentication.user.roles;
            return roles.indexOf(role) > -1;
        }

        // private functions
        function saveAuthResponse(response) {
            var authData = {
                token: response.data.token,
                expires: response.data.expires,
                user: response.data.user
            };

            localStorageSvc.set('authData', authData);
            fillAuthData();

            return authData;
        }
    }

})();