(function() {

    angular
        .module('main')
        .factory('taskServices', taskServices);

    taskServices.$inject = ['$http', 'env'];

    function taskServices($http, env) {
        return {            
            createTask: createTask,
            fetchTask: fetchTask,
            updateTask: updateTask,
            completeTask: completeTask,
            deleteTask: deleteTask
        };

        function createTask(pkg, next) {
            $http.post(env.api + 'boards/' + pkg.boardId + '/tasks', pkg)
            .then(success(next), error(next));
        }

        function fetchTask(id, next) {
            $http.get(env.api + 'tasks/' + id)
            .then(success(next), error(next));
        }

        function updateTask(pkg, next) {
            $http.put(env.api + 'tasks/' + pkg._id, pkg)
            .then(success(next), error(next));
        }

        function completeTask(id, next) {
            $http.put(env.api + 'tasks/' + id + '/complete')
            .then(success(next), error(next));
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