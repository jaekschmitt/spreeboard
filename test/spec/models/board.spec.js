require(__base + 'config/mongoose-db')

var logger = require(__base + 'config/logger'),
    mongoose = require('mongoose'),
    Board = mongoose.model('Board');
    
describe('Board', function () {
    it('should do what...', function (done) {
        done()
    });
});