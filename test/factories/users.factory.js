var factory = require('factory-girl'),
    db = require(__base + 'config/mongoose-db');

module.exports = function(factory, db) {

    factory.define('user', db.User, {
        name: 'Jake Schmitt',
        username: 'jake.schitt',
        email: 'jake.schmitt@spreetail.com',
        password: 'testing'
    });

    factory.define('gitlab-user', db.User, {
       name: 'Jake Schmitt',
        username: 'jake.schitt',
        email: 'jake.schmitt@spreetail.com',
        password: 'testing',
        gitlab: {
            id: 1
        } 
    });
    
};