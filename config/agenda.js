var logger = require('./logger'),
    config = require('./index'),
    Agenda = require('agenda');

var agenda = new Agenda({ db: { address: config.agenda.connection } }),
    jobs = config.agenda.jobs;

logger.info('Registering jobs.');
jobs.forEach(function(type) {
    require('./jobs/' + type)(agenda);
});

agenda.on('fail', function(err, job) {
    logger.crit('Error with job(' + job.attrs.name + ')');
    logger.crit(err);
});

if(jobs.length) {
    logger.info('Starting jobs');
    agenda.start();
}

module.exports = agenda;