(function() {

    angular
        .module('main')
        .controller('taskListController', taskListController);

    taskListController.$inject = ['$scope', '$routeParams', '$location', 'toastr', 'localStorageService', 'authServices', 'taskServices', 'boardServices', 'userServices'];

    var STORAGE_KEY = 'task-list.filters';

    function taskListController($scope, $routeParams, $location, toastr, _storage, _auth, _tasks, _boards, _users) {

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

        $scope.counts = {            

        };

        // functions

        $scope.applyFilters = applyFilters;
        $scope.clearFilters = clearFilters;
        $scope.getAttrColor = getAttrColor;

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
                
                filters.stages.unshift('Backlog');

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

                var prevFilters = _storage.get(STORAGE_KEY);
                filters = _.extend(filters, prevFilters);                

                setupFilters(filters);

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
            _storage.set(STORAGE_KEY, params);
            
            _tasks.searchTasks(params, function(err, results) {
                gatherCounts(results, filters);
                $scope.tasks = results;                
            });
        }        

        function clearFilters() {
            console.log('clearing filters');

            $('.task-filters').collapse('hide');

            delete $scope.filters.board;
            delete $scope.filters.status;
            delete $scope.filters.size;
            delete $scope.filters.priority;
            delete $scope.filters.stage;

            applyFilters();
        }


        // TODO: rework this so it pulls from the server please
        function getAttrColor(attr) {
            switch(attr) {
                case 'sizes':
                    return 'rgb(2, 90, 165)';
                case 'priorities':
                    return 'rgb(240, 173, 78)';
                case 'stages':
                    return 'rgb(92, 184, 92)';
                default: 
                    return '#ccc';
            }   
        }

        // private functions

        function setupFilters(filters) {
            var isFiltered = filters.board
                                || filters.status
                                || filters.size
                                || filters.priority
                                || filters.stage;

            if(isFiltered) {
                console.log('found filters');
                $('.task-filters').addClass('in');
            }
        }

        function gatherCounts(tasks, filters) {
            var counts = {
                sizes: countAttribute('size', filters.sizes, tasks),
                priorities: countAttribute('priority', filters.priorities, tasks),
                stages: countAttribute('stage', filters.stages, tasks)
            };
            
            return $scope.counts = counts;
        }

        function countAttribute(attrName, attrList, tasks) {
            var count = {};
                        
            attrList.forEach(function(attr) {
                count[attr] = tasks.filter(function(t) { return !!t[attrName] && t[attrName].name === attr; }).length;
            });

            return count;
        };

    }

})();