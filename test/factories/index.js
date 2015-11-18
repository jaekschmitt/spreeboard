var factory = require('factory-girl'),
    mongooseAdapter = require('factory-girl-mongoose').MongooseAdapter,
    path = require('path'),
    fs = require('fs'),    
    db = require(__base + 'config/mongoose-db');

factory.setAdapter(mongooseAdapter);

fs.readdirSync(path.join(__base, 'test/factories')).forEach(function(file) {
    
    if(~file.indexOf('factory.js')) 
        require(path.join(__base, 'test/factories', file))(factory, db);

});

module.exports = factory;