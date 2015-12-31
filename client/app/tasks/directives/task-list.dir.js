(function() {

    angular
        .module('main')
        .directive('taskList', taskList);

    function taskList() {
        return {
            restrict: 'E',
            scope: {
                tasks: '=tasks',
                editable: '=editable'
            },
            templateUrl: 'app/tasks/directives/task-list-tmpl.html',            
        }
    }

})();