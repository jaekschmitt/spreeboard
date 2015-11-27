var logger = require('../logger'),
    config = require('../index'),
    async = require('async'),
    _ = require('lodash'),
    db = require('../mongoose-db'),
    _gitlab = require(__base + 'lib/gitlab');



module.exports = function(agenda) {

    // push task information to issue in gitlab
    agenda.define('push-issue', function(job, done) {
        var data = job.attrs.data;

        logger.debug('Pushing gitlab issue for task: ' + data.taskId);
        
        loadLockedTask(data.taskId, function(err, task) {

            _gitlab.issues.push(data, function(err, results) {
                if(err) logger.crit(err);
           
                task.issue = results.issue;
                task.sync_lock = false;
                task.save(done);
            });
        });
    });

    // pull information from gitlab issue into system
    agenda.define('pull-issue', function(job, done) {        
        var data = job.attrs.data;        

        logger.debug('Pulling gitlab issue for task: ' + data.id);
        _gitlab.issues.pull(data, function(err, results) {
            if(err) logger.crit(err);
            done();
        });
    });

    // close an issue on gitlab
    agenda.define('close-issue', function(job, done) {
        var data = job.attrs.data;

        logger.crit('Closing gitlab issue for task: ' + data.task ? data.task._id : data.taskId);
        _gitlab.issues.close(data, function(err, results) {
            if(err) logger.crit(err);
            done();
        });
    });

};

// private functions

function loadLockedTask(id, next) {
    var options = {
        criteria: { _id : id }        
    };

    db.Task.load(options, function(err, task) {
        if(err) return next(err);
        if(!task) return next(null, null);

        task.sync_lock = true;
        task.save(function(err) {
            next(err, task);
        });
    });
}