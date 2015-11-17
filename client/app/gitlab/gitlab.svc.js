(function() {

    angular
        .module('main')
        .factory('gitlabServices', gitlabServices);

    gitlabServices.$inject = ['$http', 'env'];

    function gitlabServices($http, env) {
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