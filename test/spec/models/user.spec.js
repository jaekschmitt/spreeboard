var logger = require(__base + 'config/logger'),
    factory = require(__base + 'test/factories'),
    db = require(__base + 'config/mongoose-db')
    expect = require('chai').expect;

describe('Users', function () {    

    var user = {};

    beforeEach(function(done){ 
        factory.build('user', function(err, u) {
            user = u;
            done();
        });
    });

    afterEach(function(done) {
        db.User.remove({}, done);        
    });

    describe('#save', function () {        
        it('should validate properties', function(done) {
            factory.create('user', { name: '', email: '', password: '' }, function(err, user) {

                expect(err.name).to.equal('ValidationError');
                expect(err.errors.name.message).to.equal('Name cannot be blank');
                expect(err.errors.email.message).to.equal('Email cannot be blank');
                expect(err.errors.hashed_password.message).to.equal('Password cannot be blank');

                done();
            });
        });

        it('should generate hashed password', function() {
            expect(user.hashed_password).to.be.ok
        });

        it('should assign default roles', function() {            
            var hasUserRole = user.roles.indexOf('user') > -1;
            expect(hasUserRole).to.equal(true);
        });        
    });

    describe('#authenticate', function() {
        it('should authenticate true or false');
    });

    describe('#load', function () {        
        it('should query on criteria');
        it('should query on select');
        it('should default select to name');
    });

    describe('#list', function () {
        it('should query on criteria');
        it('should query on select');
        it('should default select to name'); 
    });
});