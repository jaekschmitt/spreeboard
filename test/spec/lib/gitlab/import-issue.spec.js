var rewire = require('rewire')    
    logger = require(__base + 'config/logger'),    
    factory = require(__base + 'test/factories'),    
    db = require(__base + 'config/mongoose-db'),
    stubs = require('./stubs'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    async = require('async'),
    _ = require('lodash');

var ImportIssue = rewire(__base + 'lib/gitlab/issues/processes/import-issue'),
    args = {
        object_attributes: {
            id: 1,
            project_id: 1,
            author_id: 1
        }
    };

describe('Gitlab#Import-Issue', function () {
    var board, label;

    before(function(done) {
        factory.create('board', function(err, b) {
            board = b;

            factory.create('stage-label', {
                name: board.stages[0].name,
                serverName: board.stages[1].serverName,
                board: board._id
            }, function(err, l) {
                label = l;

                done();
            });
        })
    });

    after(function(done) { 
        async.series([
            function(cb) { db.Label.remove({}, cb); },
            function(cb) { db.Board.remove({}, cb); }
        ], done);
    });

    describe('#no author', function () {
        var application, callback = {};
        
        before(function(done) {
            application = new ImportIssue(args);

            application.import(function(err, results) {
                callback.err = err;
                callback.results = results;
                
                done();
            });
        });

        after(function(done) { db.Task.remove({}, done); });

        it('should not create a task', function(done) {            
            db.Task.find({}, function(err, count) {
                expect(count.length).to.equal(0);                
                done();
            });
        });

        it('should return an error', function() {
            expect(callback.err).to.be.a('error');
            expect(callback.err.message).to.equal('User has not yet logged into spreeboards');
        });
    });

    describe('#no board label', function () {
        var application, callback = {};
        
        before(function(done) {
            factory.create('gitlab-user', function(err, user) {
                
                args.object_attributes.author_id = user.gitlab.id;
                ImportIssue.__set__('_gitlab', stubs.loadStub({ id: 1 }));

                application = new ImportIssue(args);
                application.import(function(err, results) {
                    callback.err = err;
                    callback.results = results;

                    done();
                });
            });
        });

        after(function(done) {
            application = callback = {};
            db.User.remove({}, function() {
                done();
            });
        });

        it('should not create a task', function(done) {
            db.Task.count({}, function(err, count) {
                expect(count).to.equal(0);
                done();
            });
        });

        it('should return an error', function() {
            expect(callback.err).to.be.a('error');
            expect(callback.err.message).to.equal('No board label present');
        });
    });

    describe('#no stage label', function () {
        var application, callback = {};

        before(function(done) {
            factory.create('gitlab-user', function(err, user) {
                
                args.object_attributes.author_id = user.gitlab.id;
                ImportIssue.__set__('_gitlab', stubs.loadStub({ labels: [board.serverName] }));

                application = new ImportIssue(args);
                application.import(function(err, results) {
                    callback.err = err;
                    callback.results = results;

                    done();
                });
            });                           
        });

        after(function(done) {
            application = callback = {};
            db.User.remove({}, function() {
                db.Task.remove({}, done);
            });
        });

        it('should return successfully', function() {
            expect(callback.err).to.not.exist;
        });

        it('should create a task', function(done) {
            db.Task.count({}, function(err, count) {
                expect(count).to.equal(1);
                done();
            });
        });

        it('should be an approved task', function() {
            var results = callback.results,
                task = results.task;

            expect(task.approved).to.equal(true);
        });

        it('should attach an author', function() {
            var results = callback.results,
                task = results.task;
            
            expect(task.created_by).to.exist;
        });

        it('should attach a board', function() { 
            var results = callback.results,
                task = results.task;

            expect(task.board).to.exist;            
        });

        it('should not create a label or attach a stage', function() {
            var results = callback.results,
                task = results.task;

            expect(task.stage).to.not.exist;            
        });
    });

    describe('#stage label', function () {
        var application, callback = {};

        before(function(done) {
            factory.create('gitlab-user', function(err, user) {
                
                args.object_attributes.author_id = user.gitlab.id;
                ImportIssue.__set__('_gitlab', stubs.loadStub({ labels: [board.serverName, board.stages[0].serverName] }));

                application = new ImportIssue(args);
                application.import(function(err, results) {
                    callback.err = err;
                    callback.results = results;

                    done();
                });
            });                           
        });

        after(function(done) {
            application = callback = {};
            db.User.remove({}, function() {
                db.Task.remove({}, function() {
                    db.Label.remove({}, done);
                });
            });
        });

        it('should return successfully', function() {
            expect(callback.err).to.not.exist;
        });

        it('should create a task', function(done) {
            db.Task.count({}, function(err, count) {
                expect(count).to.equal(1);
                done();
            });
        });

        it('should attach an author', function() {
            var results = callback.results,
                task = results.task;

            expect(task.created_by).to.exist;
        });

        it('should attach a board', function() {
            var results = callback.results,
                task = results.task;

            expect(task.board).to.exist;            
        });

        it('should attach a stage', function() {
            var results = callback.results,
                task = results.task;

            expect(task.stage).to.exist;
            
            expect(task.stage.id).to.exist;
            expect(task.stage.name).to.exist;
            expect(task.stage.serverName).to.exist;
        });
    });
});