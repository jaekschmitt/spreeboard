var logger = require(__base + 'config/logger'),
    config = require(__base + 'config'),
    agenda = require(__base + 'config/agenda'),
    db = require(__base + 'config/mongoose-db'),
    _gitlab = require(__base + 'lib/gitlab'),    
    async = require('async'),
    _ = require('lodash');

exports.projects = function(req, res, next) { 
    _gitlab.list('projects', req.user.id, function(err, projects) {
        if(err) return res.status(500).json(err);
        res.status(200).json(projects);
    });
};

exports.issuesSync = function(req, res, next) {    
    var issueInfo = req.body,
        direction = req.body.object_attributes.action;

    logger.debug('Incoming gitlab issue: ' + issueInfo.object_attributes.id + ' (' + direction + ')');

    if(['open', 'reopen', 'update'].indexOf(direction) > -1) {
        // hate this but the web hook for new issues is too fast 
        // and is importing before we update issue in existing task and
        // can query against it.  would ideally search by issue.id == issueInfo.id

        var options = {
            criteria: { 
                $or: [
                    { 'title' : issueInfo.object_attributes.title },
                    { 'issue.id' : issueInfo.object_attributes.id }
                ]
            },
            select: 'id sync_lock'
        };

        db.Task.load(options, function(err, task) {            
            if(err) return next(err);            

            if(task && task.sync_lock) {
                
                logger.debug('Corresponding task is locked');

            }else {

                logger.debug('Registering pull-issue job.');
                agenda.now('pull-issue', issueInfo.object_attributes);

            }
                        
        });

    } else if(direction == 'close') {
        logger.debug('Issue close reported.');

        var options = {
            criteria: { 
                'issue.id': issueInfo.object_attributes.id,
                sync_lock: false
            }
        };

        db.Task.load(options, function(err, task) {
            if(err) logger.crit(err);
            
            if(task) {
                logger.debug('Deleted corresponding task: ' + task._id);

                task.status = 'closed';
                task.last_status_update = new Date();

                task.save();
            }
        });
    }

    reply(res);
};

exports.mergeSync = function(req, res) {
    logger.crit(JSON.stringify(req.body, null, 4));

    reply(res);
};

// helper functions

function reply(res) {
    // properly acknowledge you have handled the webhook successfully

    res.status(200);
    res.format({
        'text/plain': function() {
            res.send('OK');
        }
    });
}