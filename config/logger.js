var config = require('./index'),
    winston = require('winston');    

var customColors = {
    trace: 'white',
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    crit: 'red', 
    fatal: 'red'
};

var logger = new (winston.Logger)({
    colors: customColors,
    levels: {
        trace: 0, 
        debug: 1,
        info: 2,
        warn: 3,
        crit: 4,
        fatal: 5
    },
    transports: [
      new (winston.transports.Console)({
        level: config.log_level,
        colorize: true,
        timestamp: false
      })
    ]
  });

winston.addColors(customColors);

// Extend logger object to properly log 'Error' types
var origLog = logger.log;

logger.log = function(level, msg) {
    var objType = Object.prototype.toString.call(msg);
    if(objType === '[object Error]') {
        origLog.call(logger, level, msg.toString());
    } else {
        origLog.call(logger, level, msg);
    }
};  

module.exports = logger;