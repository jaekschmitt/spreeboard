var mongoose = require('mongoose'),
    logger = require('./logger'),      
    config = require('./config'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    db = {};

logger.info('Initializing database.');

mongoose.connect(config.mongo);

logger.info('Connected to database.');
logger.info('Bootstrapping models.');

fs.readdirSync(path.join(__base, 'data/models')).forEach(function (file) {
  if (~file.indexOf('.js')) require(path.join(__base, 'data/models', file));
});