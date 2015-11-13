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
            createBoard: createBoard,
            fetchBoard: fetchBoard,
            fetchBoardInfo: fetchBoardInfo
        };

        function boards(next) {
            return $http.get(env.api + 'boards')
            .success(function(boards) {
                next(null, boards);
            }).catch(next);
        }

        function createBoard(pkg, next) {
            return $http.post(env.api + 'boards', pkg)
            .success(function(board) {
                next(null, board);
            }).catch(next);
        }

        function fetchBoard(id, next) {
            $http.get(env.api + 'boards/' + id)
            .success(function(results) {
                next(null, results);
            }).catch(next);
        }

        function fetchBoardInfo(id, next) {
            $http.get(env.api + 'boards/' + id + '/info')
            .success(function(info) {
                next(null, info);
            }).catch(next);
        }
    }

})();