var factory = require('factory-girl'),
    db = require(__base + 'config/mongoose-db');

module.exports = function(factory, db) {

    factory.define('task', db.Task, {
        name: 'Todo',
        description: 'Testing',
        stage: {},

        board: {},
        project: {},

        developer: {},
        owner: {},
        created_by: {},

        issue: {},

        created_at: new Date()        
    });

};