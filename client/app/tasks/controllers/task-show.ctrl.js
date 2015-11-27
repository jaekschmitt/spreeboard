(function() {

    angular
        .module('main')
        .controller('showTaskController', showTaskController);

    showTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices', 'userServices', 'authSvc'];

    function showTaskController($scope, $routeParams, $location, toastr, _tasks, _boards, _users, _auth) {

        // properties

        $scope.task = {};
        $scope.isDeveloper = _auth.authentication.user.roles.indexOf('developer') > -1;

        // functions

        activate();

        function activate() {
            var task_id = $routeParams.task_id;

            _tasks.fetchTask(task_id, function(err, task) {
                if(err) return toastr.error(err);

                $scope.task = task;
            });
        }
    }

})();