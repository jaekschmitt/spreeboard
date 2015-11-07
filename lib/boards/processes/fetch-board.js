var logger = require(__base + 'config/logger'),
    glUtils = require(__base + 'lib/gitlab'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {
        boardId: args.boardId,
        user: args.user
    };

    this.fetch = function(next) {
        logger.debug('Fetching board: ' + app.boardId);        

        async.series([
            loadBoard,
            getIssues,
            sortIssues
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            logger.debug('Finished fetchging board with 0 errors.');
            return next(null, app);
        });
    };

    // private functions

    function loadBoard(next) {
        Board.findOne({
            _id: app.boardId
        }).exec(function(err, board) {
            if(err) return next(err);
            
            app.board = board;
            next(null, app);
        });
    }

    function getIssues(next) {
        var _issues = require(__base + 'lib/issues');
        
        _issues.fetch({
            board: app.board,
            user: app.user
        }, function(err, issues) {
            if(err) return next(err);            

            app.issues = issues;
            next(null, app);
        });
    }

    function sortIssues(next) {
        var stageKeys = app.board.stages.map(function(s) { return s.toLowerCase(); }),
            stages = {};

        app.stages = [];

        // created initial empty stages for issues
        for(var i = 0; i < stageKeys.length; i++) {
            stages[stageKeys[i]] = [];
        };

        // populate the stages with the corresponding issues
        app.issues.forEach(function(i) {
            var stage = _.intersection(stageKeys, i.labels)[0] || 'backlog';
            stages[stage].push(i);
        });        

        for(var i = 0; i < stageKeys.length; i++) {
            app.stages.push({
                name: stageKeys[i],
                issues: stages[stageKeys[i]]
            });
        };        

        delete app.issues;
        return next(null, app);
    }

};

module.exports = Application;