(function() {

    var env = {
        api: 'http://localhost:3000/'
    };

    angular
        .module('main')
        .factory('boardServices', boardServices);

    boardServices.$inject = ['$http'];    

    function boardServices($http) {
        return {
            boards: boards,
            createBoard: createBoard
        };

        function boards() {
            return $http.get(env.api + 'boards');
        }

        function createBoard(pkg) {
            return $http.post(env.api + 'boards', pkg);
        }
    }

})();