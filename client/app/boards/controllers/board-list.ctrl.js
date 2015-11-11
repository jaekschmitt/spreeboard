(function() {

    angular
        .module('main')
        .controller('boardListController', boardListController);

    boardListController.$inject = ['$scope', 'toastr', 'authSvc', 'boardServices'];

    function boardListController($scope, toastr, authSvc, boardServices) {

        // properties

        $scope.boards = [];
        $scope.roles = authSvc.authentication.user.roles;

        // functions

        activate();

        function activate() {
            boardServices.boards().success(function(boards) {

            }).catch(toastr.error);
        }
    }

})();