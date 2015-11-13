(function() {

    angular
        .module('main')
        .controller('editTaskController', editTaskController);

    editTaskController.$inject = ['$scope', '$routeParams', '$q', 'toastr', 'taskServices', 'boardServices'];

    function editTaskController($scope, $routeParams, $q, toastr, taskServices, boardServices) {

        // properties

        $scope.board = {};
        $scope.task = {};        

        // functions

        $scope.update = updateTask;
        $scope.delete = deleteTask;

        activate();

        function activate() {
            var board_id = $routeParams.board_id,
                task_id = $routeParams.task_id;

            async.parallel({
                board: function(cb) { return boardServices.fetchBoardInfo(board_id, cb); },
                task: function(cb) { return taskServices.fetchTask(task_id, cb); }
            }, function(err, results) {
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.task = results.task;
            });
        }

        function updateTask() {

        }

        function deleteTask() {

        }
    }

})();