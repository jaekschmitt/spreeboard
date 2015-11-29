(function() {

    angular
        .module('main')
        .controller('showBoardController', showBoardController);

    showBoardController.$inject = ['$scope', '$routeParams', 'toastr', 'authServices', 'boardServices'];

    function showBoardController($scope, $routeParams, toastr, authServices, boardServices) {

        // properties

        var roles = authServices.authentication.user.roles;
        
        $scope.isAdmin = roles.indexOf('admin') > -1;
        $scope.isOwner = roles.indexOf('owner') > -1;

        $scope.boards = [];
        $scope.backlog = null;

        // functions

        activate();

        function activate() {
            var boardId = $routeParams.id;

            boardServices.fetchBoard(boardId, function(err, results) {
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.backlog = results.backlog;                
            });
        }
    }

})();