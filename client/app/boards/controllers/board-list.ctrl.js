(function() {

    angular
        .module('main')
        .controller('boardListController', boardListController);

    boardListController.$inject = ['$scope', 'toastr', 'authServices', 'boardServices'];

    function boardListController($scope, toastr, authServices, boardServices) {

        // properties

        $scope.boards = [];
        $scope.roles = authServices.authentication.user.roles;

        // functions

        activate();

        function activate() {
            boardServices.boards(function(err, boards) {
                if(err) return toastr.error(err);
                $scope.boards = boards;
            });
        }
    }

})();