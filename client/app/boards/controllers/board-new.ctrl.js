(function() {

    angular
        .module('main')
        .controller('newBoardController', newBoardController);

    newBoardController.$inject = ['$scope', 'toastr', 'boardServices'];

    function newBoardController($scope, toastr, boardServices) {

        // properties

        $scope.board = {};
        $scope.stages = [];

        // function

        $scope.addStage = addStage;
        $scope.removeStage = removeStage;
        $scope.createBoard = createBoard;

        activate();

        function activate() {

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
        }

    }

})();