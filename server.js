var logger = require('./config/logger'),
    express = require('express'),
    path = require('path');
    
var app = express(),
    port = process.env.PORT || 8080;

// expose root of application

global.appRoot = path.dirname(require.main.filename);

// bootstrap application settings

require('./config/express')(app);

// register application routes

require('./config/routes')(app);

// start our server

app.listen(port, function() {
    logger.info('server running on port: ' + port);
});