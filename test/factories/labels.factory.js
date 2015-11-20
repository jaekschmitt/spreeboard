var factory = require('factory-girl'),
    db = require(__base + 'config/mongoose-db');

module.exports = function(factory, db) {

    factory.define('stage-label', db.Label, {
        _id: db.types.ObjectId(),
        name: factory.seq(function(n) { return 'Stage ' + n; }),
        serverName: factory.seq(function(n) { return '(s) stage-' + n; }),
        color: '#ffffff',
        type: 'stage',
        created_at: new Date()
    });

    factory.define('priority-label', db.Label, {
        _id: db.types.ObjectId(),
        name: factory.seq(function(n) { return 'Priority ' + n; }),
        serverName: factory.seq(function(n) { return '(p) priority-' + n; }),
        color: '#ffffff',
        type: 'priority',
        created_at: new Date()
    });

    factory.define('size-label', db.Label, {
        _id: db.types.ObjectId(),
        name: factory.seq(function(n) { return 'Size ' + n; }),
        serverName: factory.seq(function(n) { return '(z) size-' + n; }),
        color: '#ffffff',
        type: 'priority',
        created_at: new Date()
    });
};