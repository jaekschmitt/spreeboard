(function() {

    var env = {
        api: 'http://localhost:3000/'
    };

    angular
        .module('main')
        .factory('taskServices', taskServices);

    taskServices.$inject = ['$http'];

    function taskServices($http) {
        return {
            createTask: createTask
        };

        function createTask(pkg, next) {
            $http.post(env.api + 'boards/' + pkg.boardId + '/tasks', pkg)
            .success(function(task) {
                next(null, task);
            }).catch(next);
        }
    }

})();