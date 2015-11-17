var logger = require('./logger'),
    path = require('path'),
    extend = require('util')._extend;

var defaults = { root: path.normalize(__dirname + '/..') },
    settings = require('config.settings.json');

logger.info('Settings loaded.');
module.exports = extend(settings, defaults);