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
        name: args.name,
        board: args.board,
        boardId: args.boardId || args.board._id,
        user: args.user
    };

    this.add = function(next) {
        logger.debug('Adding attribute to board: ' + app.boardId);

        async.series([
            loadBoard,
            tryLoadLabel,
            createLabel,
            adjustBoard,
            syncLabel
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
            criteria: { name: app.name, board: app.board._id }
        };

        Label.load(options, function(err, label) {
            if(err) return next(err);

            app.label = label;
            app.existing = !!label;

            return next(null, app);
        });
    }

    function createLabel(next) {
        if(app.label) return next(null, app);

        var label = new Label({
            name: app.name,
            board: app.board._id,
            type: app.type,
            color: getColor(app.type)
        });

        label.generateServerName();
        label.save(function(err) {
            if(err) return next(err);

            app.label = label;
            app.existing = false;

            return next(null, app);
        });
    }

    function adjustBoard(next) {
        var label = app.label,
            attrName = getPlural(app.type),
            existingAttrs = app.board[attrName],
            index = _.findIndex(existingAttrs, { _id: label._id });

        if(index > 0) return next(null, app);

        app.board[attrName].push({
            id: label._id,
            name: label.name,
            serverName: label.serverName,
            color: label.color
        });

        app.board.save(function(err){ 
            if(err) return next(err);
            next(null, app);
        });
    }

    function syncLabel(next) {
        var label = app.label;

        _gitlab.create('labels', app.user._id, {
            projectId: app.board.project.id,
            name: label.serverName,
            color: label.color
        }, function(err) {
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

    function getColor(type) {
        switch(type) {
            case 'stage': return '#84E6C4';
            case 'priority': return '#f0ad4e';
            case 'size': return '#025aa5';
            default: throw 'Unknown attribute type';
        }
    }

};

module.exports = Application;