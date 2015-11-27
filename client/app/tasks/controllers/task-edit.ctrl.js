(function() {

    angular
        .module('main')
        .controller('editTaskController', editTaskController);

    editTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices', 'userServices'];

    function editTaskController($scope, $routeParams, $location, toastr, _tasks, _boards, _users) {

        // properties

        $scope.board = {};
        $scope.users = [];
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
                task: function(cb) { return _tasks.fetchTask(task_id, cb); },
                users: function(cb) {return _users.list('role=owner', cb); }
            }, function(err, results) {
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.users = results.users || [];
                $scope.task = results.task;                
            });
        }

        function updateTask() {
            if($scope.working) return;

            var pkg = $scope.task;

            if(pkg.developer) pkg.developer = pkg.developer._id;
            if(pkg.owner) pkg.owner = pkg.owner._id;

            $scope.working = true;

            _tasks.updateTask(pkg, function(err) {
                $scope.working = false;

                if(err) return toastr.error(err);

                toastr.success('Task updated!');
                $location.path('/boards/' + $scope.board._id);
            });          
        }

        function deleteTask() {            
            if($scope.working) return;
            $scope.working = true;

            _tasks.deleteTask($scope.task._id, function(err) {
                $scope.working = false;

                if(err) return toastr.error(err);
                $location.path('/boards/' + $scope.board._id);
            });
        }
    }

})();