var logger = require(__base + 'config/logger'),    
    factory = require(__base + 'test/factories'),
    db = require(__base + 'config/mongoose-db'),
    async = require('async'),
    expect = require('chai').expect;

describe('Tasks', function () {
    var user, board;

    before(function (done) {
        async.series([
            function(cb) { factory.create('user', cb); },
            function(cb) { factory.create('board', cb); }
        ], function(err, results) {
            user = results[0];
            board = results[1];
            done();
        });
    });

    after(function (done) {
        async.parallel([
            function(cb) { db.Board.remove({}, cb); },
            function(cb) { db.User.remove({}, cb); }
        ], function(err) {
            user = board = null;
            done();
        });
    });


    describe('#save', function () {    
        var task;

        beforeEach(function (done) {
            factory.build('task', function(err, t) {
                task = t;
                done();
            });
        });

        afterEach(function (done) {
            db.Task.remove({}, done);
        });

        it('should require a title', function(done) {
            task.title = '';
            task.save(function(err) {                
                expect(err).to.exist;
                expect(err.name).to.equal('ValidationError');
                expect(err.errors.title.message).to.equal('Title cannot be blank');
                done();
            });
        });

        it('should default approved to false', function(done) {
            task.save(function(err) {
                expect(task.approved).to.equal(false);
                done();
            });
        });

        it('should default to sync locked', function(done) {
            task.save(function(err) {
                expect(task.sync_lock).to.equal(true);
                done();
            });
        });

        it('should populate date created', function (done) {
            task.save(function(err) {
                expect(task.created_at).to.exist;
                done();
            });
        });

    });

});