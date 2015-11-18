var logger = require(__base + 'config/logger'),
    db = require(__base + 'config/mongoose-db');
    
describe('Board', function () {
    
    beforeEach(function() { 

    });

    afterEach(function() {

    });

    describe('#save', function () {
        it('should validate properties');
        it('should generate server name');        
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