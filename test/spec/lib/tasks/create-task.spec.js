var rewire = require('rewire')    
    logger = require(__base + 'config/logger'),
    factory = require(__base + 'test/factories'),    
    db = require(__base + 'config/mongoose-db'),
    async = require('async'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    _ = require('lodash');

var CreateTaskApplication = require(__base + 'lib/tasks/processes/create-task');

describe('Tasks#Create-Task', function () {
    var board, user, label;

    before(function (done) {
        async.series([
            function(cb) { 
                factory.create('board', function(err, b) {
                    board = b;
                    cb();
                }); 
            },
            
            function(cb) { 
                factory.create('stage-label', {
                    board: board._id,
                    name: board.stages[0].name,
                    serverName: board.stages[0].serverName                    
                }, function(err, l) {
                    label = l;
                    cb();
                });
            },
            
            function(cb) { 
                factory.create('user', function(err, u) {
                    user = u;
                    cb();
                }); 
            }
        ], done);
        
    });

    after(function(done) {
        async.parallel([
            function(cb) { db.Board.remove({}, cb); },
            function(cb) { db.Label.remove({}, cb); },
            function(cb) { db.User.remove({}, cb); }
        ], function(err) {
            board = user = null;
            done();
        });
    });

    describe('#cannot find board', function () {
        var callback = {};

        beforeEach(function (done) {
            runCreateTask({ boardId: db.types.ObjectId() }, function(err, results){
                callback.err = err;
                callback.results = results;

                done();
            });
        });

        afterEach(function (done) {
            db.Task.remove({}, function(err) {
                callback = {};
                done();
            });
        });

        it('should return an error', function() {
            expect(callback.err).to.exist;            
            expect(callback.err).to.be.a('error');
            expect(callback.err.message).to.equal('No board attached');
        });

        it('should not create a task', function(done) {
            db.Task.count({}, function(err, count) {
                expect(count).to.equal(0);
                done();
            });
        });
    });

    describe('#valid', function () {
        var callback = {};            

        beforeEach(function (done) {
            var args = { 
                boardId: board._id,
                user: user,
                stage: {
                    name: board.stages[0].name,
                    serverName: board.stages[0].serverName
                }
            };

            runCreateTask(args, function(err, results){
                callback.err = err;
                callback.results = results;

                done();
            });
        });

        afterEach(function (done) {
            db.Task.remove({}, function(err) {
                callback = {};
                done();
            });
        });

        it('should create a task', function(done) {
            var createdTask = callback.results.task,
                query = { _id: createdTask._id };
            
            expect(createdTask).to.exist;            
            db.Task.findOne(query, function(err, task) {                
                expect(task).to.exist;

                expect(task.title).to.equal(createdTask.title);
                expect(task.description).to.equal(createdTask.description);

                done();
            });
        });

        it('should set sync lock on task', function() {
            var results = callback.results,
                task = results.task;

            expect(task.sync_lock).to.equal(true);
        });

        it('should associate the creator', function(done) {
            var results = callback.results,
                createdTask = results.task,
                criteria = { _id: createdTask._id };

            db.Task.findOne(criteria)
                .populate('created_by')
                .exec(function(err, task) {
                    var creator = task.created_by;

                    expect(creator._id.toString()).to.equal(user._id.toString());
                    done();
                });
        });

        it('should set the stage', function() {
            var results = callback.results,
                task = results.task;

            expect(task.stage).to.exist;

            expect(task.stage.id).to.exist;
            expect(task.stage.name).to.exist;
            expect(task.stage.serverName).to.exist;            
        });
    });    

});

// helpers

function runCreateTask(args, next) {
    var params = _.extend({
        title: 'Test Task',
        description: 'Test Description',
        stage: { name: 'Todo', serverName: '(s) todo' }        
    }, args);

    var application = new CreateTaskApplication(params);
    application.create(next);
};