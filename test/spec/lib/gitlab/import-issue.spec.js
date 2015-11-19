var rewire = require('rewire')    
    logger = require(__base + 'config/logger'),    
    factory = require(__base + 'test/factories'),    
    db = require(__base + 'config/mongoose-db')    
    expect = require('chai').expect,
    sinon = require('sinon'),
    _ = require('lodash');

var ImportIssue = rewire(__base + 'lib/gitlab/issues/processes/import-issue'),        
    args = {
        object_attributes: {
            id: 1,
            project_id: 1,
            author_id: 1
        }        
    };

var gitlabStub = {
    issues: {
        load: function(args, cb) {
            cb(null, factory.buildSync('gitlab-issue', { id : 1 }));
        }
    }
};

ImportIssue.__set__('_gitlab', gitlabStub);

describe('Gitlab#Import-Issue', function () {        
    
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
            db.Task.count({}, function(err, count) {
                expect(count).to.equal(0);

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
                
                var application = new ImportIssue(args);
                application.import(function(err, results) {
                    callback.err = err;
                    callback.results = results;

                    done();
                });
            });
        });

        after(function(done) {
            db.User.remove({}, done);
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
        before(function(done) {
            factory.create('gitlab-user', function(err, user) {
                args.object_attributes.author_id = user.gitlab.id;
                
                var application = new ImportIssue(args);
        //         application.import(function(err, results) {
        //             callback.err = err;
        //             callback.results = results;

                    done();
        //         });
            });                           
        });

        after(function(done) {
            db.User.remove({}, done);
        });

        it('should create a task');
        it('should attach an author');
        it('should attach a board');
        it('should not create a label or attach a stage');
    });

    describe('#stage label', function () {
        it('should create a task');
        it('should attach an author');
        it('should attach a board');
        it('should attach a stage');
    });

});