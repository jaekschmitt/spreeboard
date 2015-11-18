var logger = require(__base + 'config/logger'),
    db = require(__base + 'config/mongoose-db');

describe('User', function () {
    var user;

    beforeEach(function(done) {
        user = new db.User({
            name: 'Jake Schmitt',
            email: 'jaekschmitt@gmail.com',
            password: 'tester'
        });

        user.save(done);
    });

    after(function(done) {
        db.User.remove({}, done);
    });

    it('should do what...', function (done) {
        done()
    });
});