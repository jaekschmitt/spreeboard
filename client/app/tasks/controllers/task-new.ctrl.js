(function() {

    angular
        .module('main')
        .controller('newTaskController', newTaskController);

    newTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices'];

    function newTaskController($scope, $routeParams, $location, toastr, taskServices, boardServices) {

        // properties

        $scope.board = {};
        $scope.task = {};

        $scope.working = false;

        // functions

        $scope.createTask = createTask;

        activate();

        function activate() {
            boardServices.fetchBoardInfo($routeParams.board_id, function(err, board) {
                if(err) return toastr.error(err);
                $scope.board = board;
            });
        }

        function createTask() {
            if($scope.working) return;

            var pkg = {
                title: $scope.task.title,
                description: $scope.task.description,
                stage: $scope.task.stage,
                boardId: $scope.board._id
            };            

            $scope.working = true;
            taskServices.createTask(pkg, function(err, task) {                
                $scope.working = false;

                if(err) {
                    toastr.error(err);
                } else {
                    $location.path('/boards/' + pkg.boardId);                    
                }                
            });
        }
    }

})();