var factory = require('factory-girl'),
    db = require(__base + 'config/mongoose-db');

module.exports = function(factory, db) {

    factory.define('board', db.Board, {
        _id: db.types.ObjectId(),
        name: 'board',
        serverName: '(b) board',
        
        stages: [{
            id: db.types.ObjectId(),
            name: 'Stage 1',
            serverName: '(s) stage-1'
        }, {
            name: 'Stage 2',
            serverName: '(s) stage-2'
        }],

        priorities: [{
            id: db.types.ObjectId(),
            name: 'Priority 1',
            serverName: '(p) priority-1'
        }, {
            id: db.types.ObjectId(),
            name: 'Priority 2',
            serverName: '(p) priority-2'
        }],
        
        sizes: [],
        
        project: {}
    });

};