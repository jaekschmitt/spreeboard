var rewire = require('rewire')    
    logger = require(__base + 'config/logger'),
    factory = require(__base + 'test/factories'),    
    db = require(__base + 'config/mongoose-db'),
    async = require('async'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    _ = require('lodash');

var stages = [
    { name: 'Todo', serverName: '(s) todo' },
    { name: 'Done', serverName: '(s) done' }
];

describe('Fetch Board', function () {
    var board;

    before(function (done) {
        async.waterfall([

            function(cb) { factory.create('board', { stages: stages }, cb); },
            function(cb) { factory.create('stage-label', stages[0], cb); },
            function(cb) { factory.create('stage-label', stages[1], cb); }

        ], done);
    });

    it('should return a board');
    it('should fetch all related tasks');
    it('should sort all tasks');
    it('should get backlog counts');

    after(function(done) {
        
        async.series([
            function(cb) { db.Label.remove({}, done); },
            function(cb) { db.Board.remove({}, done); }
        ], done);        
    });

});