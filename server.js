var logger = require('./config/logger'),
    config = require('./config/config'),
    express = require('express'),
    oauthshim = require('oauth-shim'),
    passport = require('passport'),
    path = require('path');
    
var app = express(),
    port = process.env.PORT || 3000;

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

// register our oauth shim
app.all('/oauthproxy', oauthshim)

oauthshim.init([{
    // id: secret
    client_id: config.gitlab.key,
    client_secret: config.gitlab.secret,

    grant_url: config.gitlab.grant_url    
}]);

// start our server

app.listen(port, function() {
    logger.info('server running on port: ' + port);
});