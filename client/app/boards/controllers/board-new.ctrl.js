(function() {

    angular
        .module('main')
        .controller('newBoardController', newBoardController);

    newBoardController.$inject = ['$scope', '$location', 'toastr', 'boardServices', 'gitlabServices'];

    function newBoardController($scope, $location, toastr, boardServices, gitlabServices) {

        // properties

        $scope.board = {};
        $scope.projects = [];
        $scope.stages = [];

        // function

        $scope.addStage = addStage;
        $scope.removeStage = removeStage;
        $scope.createBoard = createBoard;

        activate();

        function activate() {
            gitlabServices.projects(function(err, projects) {
                $scope.projects = projects;
            });

            $('[data-toggle="tooltip"]').tooltip()
        }

        function addStage(stage) {
            if(!stage) return
            if($scope.stages.indexOf(stage) >= 0) 
                return;

            $scope.stages.push(stage);
            $scope.stage = '';
        }

        function removeStage(stage) {
            var idx = $scope.stages.indexOf(stage);
            if(idx >= 0) $scope.stages.splice(idx, 1);                
        }

        function createBoard() {
            var pkg = $scope.board;
            pkg.stages = $scope.stages;

            console.log(pkg);
            boardServices.createBoard(pkg, function(err, board) {
                $location.path('/boards/' + board.id);
            });
        }

    }

})();