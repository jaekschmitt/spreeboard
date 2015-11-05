var logger = require('./config/logger'),
    express = require('express'),
    passport = require('passport'),
    path = require('path');
    
var app = express(),
    port = process.env.PORT || 8888;

// create globals

global.__base = __dirname + "/";

// expose root of application

global.appRoot = path.dirname(require.main.filename);

// connect to our mongo database
require('./config/mongoose-db');

// bootstrap passport config
require('./config/passport')(passport);

// bootstrap application settings
require('./config/express')(app, passport);

// register application routes
require('./config/routes')(app, passport);

// start our server

app.listen(port, function() {
    logger.info('server running on port: ' + port);
});