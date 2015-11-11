(function() {

    angular
        .module('main')
        .controller('showBoardController', showBoardController);

    showBoardController.$inject = ['$scope', '$routeParams', 'toastr', 'authSvc', 'boardServices'];

    function showBoardController($scope, $routeParams, toastr, authSvc, boardServices) {

        // properties

        $scope.boards = [];
        $scope.stages = [];

        // functions

        activate();

        function activate() {
            var boardId = $routeParams.id;

            boardServices.fetchBoard(boardId, function(err, results) {
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.stages = results.stages;
            });
        }
    }

})();