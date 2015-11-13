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
            createTask: createTask,
            fetchTask: fetchTask,
            deleteTask: deleteTask
        };

        function createTask(pkg, next) {
            $http.post(env.api + 'boards/' + pkg.boardId + '/tasks', pkg)
            .then(function(response) {
                next(null, response.data);
            }, function(response) {
                next(response.data);
            });
        }

        function fetchTask(id, next) {
            $http.get(env.api + 'tasks/' + id)
            .then(success(next), function(response) {
                next(response.data);
            });
        }

        function deleteTask(id, next) {
            $http.delete(env.api + 'tasks/' + id)
            .then(success(next), error(next));
        }

        // private functions

        function success(next) {
            return function(response) { next(null, response ? response.data : null); };
        }

        function error(next) {
            return function(response) { next(response.data); };
        }
    }

})();