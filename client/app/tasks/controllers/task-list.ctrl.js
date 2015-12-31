(function() {

    angular
        .module('main')
        .controller('taskListController', taskListController);

    taskListController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'authServices', 'taskServices', 'boardServices', 'userServices'];

    function taskListController($scope, $routeParams, $location, toastr, _auth, _tasks, _boards, _users) {

        // properties

        var roles = _auth.authentication.user.roles;
        
        $scope.isAdmin = roles.indexOf('admin') > -1;
        $scope.isOwner = roles.indexOf('owner') > -1;

        $scope.tasks = [];

        $scope.filters = {
            boards: [],            
            statuses: [],
            stages: [],
            priorities: [],
            sizes: [],
            developers: [],
            owners: []
        };

        // functions

        $scope.applyFilters = applyFilters;

        activate();

        function activate() {
            async.parallel({
                boards: function(cb) { _boards.boards(cb); },
                users: function(cb) { _users.list(cb); }
            }, function(err, results) {                
                var boards = results.boards,
                    users = results.users,
                    filters = {};

                filters.boards = boards.map(function(b) { return { _id: b._id, name: b.name }; });

                filters.stages = _.chain(boards)
                                .pluck('stages')
                                .flatten()
                                .pluck('name')
                                .uniq()
                                .value();

                filters.priorities = _.chain(boards)
                                    .pluck('priorities')
                                    .flatten()          
                                    .pluck('name')
                                    .uniq()
                                    .value();

                filters.sizes = _.chain(boards)
                                .pluck('sizes')
                                .flatten()
                                .pluck('name')
                                .uniq()
                                .value();                
                
                filters.developers = users.filter(function(u) { return u.roles.indexOf('developer') > -1; });
                filters.owners = users.filter(function(u) { return u.roles.indexOf('owner') > -1; });
                
                $scope.filters = filters;
                applyFilters();                
            });
        }

        function applyFilters() {
            var filters = $scope.filters,
                params = {
                    board: filters.board ? filters.board._id : undefined,
                    status: filters.status,
                    size: filters.size,
                    priority: filters.priority,
                    stage: filters.stage
                };

            console.log(params);

            _tasks.searchTasks(params, function(err, results) {
                console.log(results);
                $scope.tasks = results;
            });
        }


    }

})();