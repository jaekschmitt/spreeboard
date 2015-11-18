var logger = require(__base + 'config/logger'),
    _gitlab = require(__base + 'lib/gitlab'),
    async = require('async'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board'),
    Label = mongoose.model('Label');

var Application = function(args) {
    var app = {
        type: args.type,
        attrId: args.attrId,
        board: args.board,
        boardId: args.boardId || args.board._id,
        user: args.user
    };

    this.remove = function(next) {
        logger.debug('Removing attribute to board: ' + app.boardId);

        async.series([
            loadBoard,
            tryLoadLabel,            
            adjustBoard,            
            syncLabels,
            destroyLabel
        ], function(err, results) {
            if(err) {
                logger.crit(err);
                return next(err);
            }

            delete app['board'];
            delete app['boardId'];
            delete app['user'];
            delete app['existing'];

            logger.debug('Finished adding attribute with 0 errors.');
            return next(null, app);
        });
    };

    // private functions

    function loadBoard(next) {
        if(app.board) return next(null, app);

         var options = {
            criteria: { _id : id },
            select: 'id name serverName created_by created_at stages'
        };    

        Board.load(options, function(err, board) {
            if(err) return next(err);            
            
            app.board = board;
            next(null, app);
        });
    }

    function tryLoadLabel(next) {
        var options = {
            criteria: { _id: app.attrId }
        };

        Label.load(options, function(err, label) {
            if(err) return next(err);

            app.label = label;
            app.existing = !!label;            

            return next(null, app);
        });
    }

    function adjustBoard(next) {
        var label = app.label,
            attrName = getPlural(app.type),
            existingAttrs = app.board[attrName],
            index = _.findIndex(existingAttrs, { id: label._id });

        logger.crit(JSON.stringify(label, null, 4));
        logger.crit(JSON.stringify(existingAttrs, null, 4));
        logger.crit(index);

        if(index < 0) return next(null, app);
        
        app.board[attrName].splice(index, 1);
        app.board.save(function(err){ 
            if(err) return next(err);
            next(null, app);
        });
    }

    function syncLabels(next) {
        var label = app.label;

        _gitlab.destroy('labels', app.user._id, {
            projectId: app.board.project.id,
            name: label.serverName            
        }, function(err) {
            if(err) return next(err);            
            next(null, app);
        });
    }

    function destroyLabel(next) {
        var options = {
            criteria: { _id: app.label._id }
        };

        Label.delete(options, function(err, label) {
            if(err) return next(err);
            next(null, app);
        });
    }

    // helper functions
    function getPlural(type) {
        switch(type) {
            case 'stage': return 'stages';
            case 'priority': return 'priorities';
            case 'size': return 'sizes';
            default: throw 'Unknown attribute type';
        }
    }

};

module.exports = Application;