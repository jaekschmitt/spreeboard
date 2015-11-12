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

        activate();

        function activate() {

        }

    }

})();