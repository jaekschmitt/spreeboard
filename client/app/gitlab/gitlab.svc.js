(function() {

    var env = {
        api: 'http://localhost:3000/'
    };

    angular
        .module('main')
        .factory('gitlabServices', gitlabServices);

    gitlabServices.$inject = ['$http'];

    function gitlabServices($http) {
        return {
            projects: projects
        };

        function projects(next) {
            $http.get(env.api + 'gitlab/projects')
            .success(function(projects) {
                next(null, projects);
            }).catch(next);
        }
    }
})();