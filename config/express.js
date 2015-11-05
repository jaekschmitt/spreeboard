var express = require('express'),    
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),    
    multer = require('multer'),
    flash = require('connect-flash'),
    path = require('path');    

module.exports = function(app, passport) {

    // register our parsers

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // setup our sessions

    app.use(session({ 
        secret: 'ilovescotchscotchyscotchscotch',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 3600000 }
    }));

    app.use(flash());

    // view registration

    var clientRoot = path.join(global.appRoot,'client');

    app.set('views', clientRoot + '/views');    
    app.set('view engine', 'vash');

    // set up our public "static" directories
    
    app.use(express.static(clientRoot));
    app.use(express.static(path.join(clientRoot, 'app')));
    app.use(express.static(path.join(clientRoot, 'public')));

    // passport middleware setup    
    app.use(passport.initialize());
    app.use(passport.session());    

    // set up cors middleware

    app.use(function (req, res, next) {     

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });

    // override our method bodies so we may use put and delete

    app.use(multer());
    app.use(methodOverride(function(req, res) {
        if(req.body && typeof req.body === 'object' && '_method' in req.body) {
            
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

};