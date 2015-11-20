var mongoose = require('mongoose'),
    logger = require('./logger'),      
    config = require('./index'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    db = {},
    testing = process.env.NODE_ENV == 'test';

if(!testing) logger.info('Initializing database.');

mongoose.connect(config.mongo);

if(!testing) logger.info('Connected to database.');
if(!testing) logger.info('Bootstrapping models.');

var models = {},
    model = null;

fs.readdirSync(path.join(__base, 'data/models')).forEach(function (file) {
    if (~file.indexOf('.js')) {
        model = require(path.join(__base, 'data/models', file));

        if(model) {
            models[model.name] = model.schema;
        }
    }
});

if(!testing) logger.info('Bootstrapped ' + _.keys(models).length + ' models');

module.exports = _.extend({
        connection: mongoose.connection,
        types: mongoose.Types
    },models);