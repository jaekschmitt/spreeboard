var factory = require('factory-girl'),
    db = require(__base + 'config/mongoose-db');

module.exports = function(factory, db) {

    factory.define('board', db.Board, {
        name: 'board',
        serverName: '(b) board',
        stages: [{ name: 'Backlog', serverName: '(s) backlog' }],
        priorities: [],
        sizes: [],
        project: {}
    });
};