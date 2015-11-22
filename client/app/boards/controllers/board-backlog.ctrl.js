(function() {

    angular
        .module('main')
        .controller('boardBacklogController', boardBacklogController);

    boardBacklogController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'boardServices', 'taskServices'];

    function boardBacklogController($scope, $routeParams, $location, toastr, _boards, _tasks) {

        // properties 

        $scope.info = {};        
        $scope.tasks = {};

        // functions

        $scope.approve = approve;

        activate();

        function activate() {
            var board_id = $routeParams.board_id;

            _boards.fetchBacklog(board_id, function(err, backlog) {
                if(err) return toastr.error(err);

                var tasks = backlog.tasks;
                delete backlog.tasks;

                $scope.info = backlog;
                $scope.tasks = {
                    approved: _.where(tasks, { approved: true }),
                    notApproved: _.where(tasks, { approved: false })
                };
            });
        }

        function approve(task) {
            var pkg = {
                _id: task._id,
                approved: true
            };

            _tasks.updateTask(pkg, function(err, response) {
                if(err) return toastr.error(err);
            });
        }
    }

})();