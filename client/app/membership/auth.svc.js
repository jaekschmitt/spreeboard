(function() {

    angular
        .module('main')
        .factory('authSvc', authService);


    authService.$inject = ['$http', '$q', 'localStorageService'];

    var authentication = {
            isAuth: false,
            user: {}
        };

    function authService($http, $q, localStorageSvc) {

        registerGitlabAuth();

        return {
            saveRegistration: saveRegistration,
            login: login,
            devLogin: devLogin,
            logout: logout,
            fillAuthData: fillAuthData,
            authentication: authentication
        };      

        function registerGitlabAuth() {
            hello.init({
                'gitlab': '2a1e3f5a0a0a98449fe5888d83e579dcf237d4de2a3809cb676d120a21b64b62'
            }, {
                oauth_proxy: 'http://localhost:3000/oauthproxy'        
            });
        }

        function saveRegistration(registration, next) {            
            $http.post('http://localhost:3000/users', registration)
            .then(function(response) {
                var authData = saveAuthResponse(response);
                return next(null, authData);
            }).catch(next);
        }

        function login(loginData) {
            
        }

        function devLogin(next) {
            var gitlab = hello('gitlab');            

            gitlab.login().then(function(authPkg) {
                
                gitlab.api('me').then(function(profile) {
                    
                    $http.post('http://localhost:3000/users/session/gitlab', profile)
                    .then(function(response) {
                        var authData = saveAuthResponse(response);
                        return next(null, authData);
                    })
                    .catch(function(err) {
                        logout();
                        return next(err);
                    });

                });                
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