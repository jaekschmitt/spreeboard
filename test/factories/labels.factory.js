var factory = require('factory-girl'),
    db = require(__base + 'config/mongoose-db');

module.exports = function(factory, db) {

    factory.define('stage-label', db.Label, {
        name: 'Todo',
        serverName: '(s) todo',
        color: '#ffffff',
        type: 'stage',
        created_at: new Date()
    });
};