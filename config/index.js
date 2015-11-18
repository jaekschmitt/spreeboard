var logger = require('./logger'),
    path = require('path'),
    extend = require('util')._extend;

var defaults = { root: path.normalize(__dirname + '/..') },
    env = process.env.NODE_ENV || 'development',
    settings = require('./env/' + env + '.json');

logger.info('Settings loaded.');
module.exports = extend(settings, defaults);