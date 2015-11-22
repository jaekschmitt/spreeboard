(function() {

    angular
        .module('main')
        .factory('boardServices', boardServices);

    boardServices.$inject = ['$http', 'env'];

    function boardServices($http, env) {
        return {
            boards: boards,
            createBoard: createBoard,
            fetchBoard: fetchBoard,
            fetchBoardInfo: fetchBoardInfo,
            fetchBoardSettings: fetchBoardSettings,
            fetchBacklog: fetchBacklog,
            addBoardAttribute: addBoardAttribute,
            removeBoardAttribute: removeBoardAttribute
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

        function fetchBoardSettings(id, next) {
            $http.get(env.api + 'boards/' + id + '/settings')
            .then(success(next), error(next));
        }

        function fetchBacklog(id, next) {
            $http.get(env.api + 'boards/' + id + '/backlog')
            .then(success(next), error(next));
        }

        function addBoardAttribute(args, next) {
            $http.post(env.api + 'boards/' + args.board_id + '/' + args.type, { name: args.name })            
            .then(success(next), error(next));
        }

        function removeBoardAttribute(args, next) {
            $http.delete(env.api + 'boards/' + args.board_id + '/' + args.type + '/' + args.attrId)
            .then(success(next), error(next));   
        }

        // private functions

        function success(next) {
            return function(response) { next(null, response ? response.data : null); };
        }

        function error(next) {
            return function(response) { next(response.data); };
        }
    }

})();