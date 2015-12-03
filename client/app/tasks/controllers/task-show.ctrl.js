(function() {

    angular
        .module('main')
        .controller('showTaskController', showTaskController);

    showTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices', 'userServices', 'authServices'];

    function showTaskController($scope, $routeParams, $location, toastr, _tasks, _boards, _users, _auth) {

        // properties

        $scope.task = {};

        $scope.taskLink = '#';
        $scope.isDeveloper = _auth.authentication.user.roles.indexOf('developer') > -1;

        // functions

        $scope.complete = complete;

        activate();

        function activate() {
            var task_id = $routeParams.task_id;

            _tasks.fetchTask(task_id, function(err, task) {
                if(err) return toastr.error(err);
                $scope.task = task;
            });
        }

        function complete() {
            var task_id = $scope.task._id;

            _tasks.completeTask(task_id, function(err, task) {
                if(err) return toastr.error(err);
                $location.path('/boards/' + $scope.task.board);
            });
        }
    }

})();