(function() {

    angular
        .module('main')
        .controller('editTaskController', editTaskController);

    editTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices'];

    function editTaskController($scope, $routeParams, $location, toastr, _tasks, _boards) {

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
                board: function(cb) { return _boards.fetchBoardInfo(board_id, cb); },
                task: function(cb) { return _tasks.fetchTask(task_id, cb); }
            }, function(err, results) {
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.task = results.task;
            });
        }

        function updateTask() {

        }

        function deleteTask() {            
            if($scope.working) return;
            $scope.working = true;

            _tasks.deleteTask($scope.task._id, function(err) {
                $scope.working = false;

                if(err) toastr.error(err);
                $location.path('/boards/' + $scope.board._id);
            });
        }
    }

})();