(function() {

    angular
        .module('main')
        .controller('boardSettingsController', boardSettingsController);

    boardSettingsController.$inject = ['$scope', '$routeParams', 'toastr', 'boardServices'];

    function boardSettingsController($scope, $routeParams, toastr, _boards) {

        // properties

        $scope.board = {};

        // functions

        $scope.addPriority = addPriority;        
        $scope.removePriority = removePriority;
        $scope.addSize = addSize;        
        $scope.removeSize = removeSize;        

        activate();

        function activate() {
            var board_id = $routeParams.board_id;

            _boards.fetchBoardSettings(board_id, function(err, board) {
                if(err) return toastr.error(err);
                $scope.board = _.extend({ priorities: [], sizes: [] }, board);
            });
        }

        function addPriority(p) {
            if(!p || _.findWhere($scope.board.priorities, { name: p })) return;
            
            _boards.addBoardAttribute({
                board_id: $scope.board._id,
                type: 'priority',
                name: p
            }, function(err, attr) {                
                if(err) return toastr.error(err);

                $scope.board.priorities.push({ name: p, _id: attr._id });
                $scope.priority = '';
            });            
        }

        function removePriority(p) {
            var idx = $scope.board.priorities.indexOf(p);
            
            if(idx > -1) {
                _boards.removeBoardAttribute({
                    board_id: $scope.board._id,
                    type: 'priority',
                    attrId: p._id
                }, function(err, attr) {
                    if(err) return toastr.error(err);
                    $scope.board.priorities.splice(idx, 1);
                });                
            }
        }

        function addSize(s) {
            if(!s || _.findWhere($scope.board.sizes, { name: s })) return;
            
            _boards.addBoardAttribute({
                board_id: $scope.board._id,
                type: 'size',
                name: s
            }, function(err, attr) {                
                if(err) return toastr.error(err);

                $scope.board.sizes.push({ name: s, _id: attr._id });
                $scope.size = '';
            });            
        }

        function removeSize(s) {
            var idx = $scope.board.sizes.indexOf(s);
            
            if(idx > -1) {
                _boards.removeBoardAttribute({
                    board_id: $scope.board._id,
                    type: 'size',
                    attrId: s._id
                }, function(err, attr) {
                    if(err) return toastr.error(err);
                    $scope.board.sizes.splice(idx, 1);
                });                
            }
        }

    }

})();