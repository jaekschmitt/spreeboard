(function() {

    angular
        .module('main')
        .controller('newTaskController', newTaskController);

    newTaskController.$inject = ['$scope', '$routeParams', 'toastr', 'taskServices', 'boardServices'];

    function newTaskController($scope, $routeParams, toastr, taskServices, boardServices) {

        // properties

        $scope.board = {
            id: $routeParams.board_id,
            name: $routeParams.board_name            
        };

        $scope.task = {};

        // functions

        $scope.createTask = createTask;

        activate();

        function activate() {}

        function createTask() {
            var pkg = {
                name: $scope.task.name,
                description: $scope.task.description,
                boardId: $scope.board.id
            };            

            taskServices.createTask(pkg, function(err, task) {
                if(err) return toastr.error(err);
            });
        }
    }

})();