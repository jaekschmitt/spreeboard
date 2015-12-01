(function() {

    angular
        .module('main')
        .controller('newTaskController', newTaskController);

    newTaskController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'taskServices', 'boardServices', 'userServices', 'authServices'];

    function newTaskController($scope, $routeParams, $location, toastr, _tasks, _boards, _users, _auth) {

        // properties

        $scope.board = {};
        $scope.users = {};
        $scope.task = {};

        $scope.isDeveloper = _auth.hasRole('developer');
        $scope.isOwner = _auth.hasRole('owner');

        $scope.working = false;

        // functions

        $scope.createTask = createTask;

        activate();

        function activate() {
            var board_id = $routeParams.board_id;

            async.parallel({
                board: function(cb) { return _boards.fetchBoardInfo(board_id, cb); },
                users: function(cb) { return _users.list(cb); }
            }, function(err, results){ 
                if(err) return toastr.error(err);

                $scope.board = results.board;
                $scope.users = results.users;
            });
        }

        function createTask() {
            if($scope.working) return;
            
            var task = $scope.task;
            var pkg = {
                title: task.title,
                description: task.description,
                stage: task.stage,
                priority: task.priority,
                size: task.size,
                developer: task.developer ? task.developer._id : null,
                owner: task.owner ? task.owner._id : null,
                boardId: $scope.board._id
            };            

            $scope.working = true;
            _tasks.createTask(pkg, function(err, task) {                
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