var GLUtil = require('./utils');

module.exports = {
    issues: require('./issues'),
    projects: require('./projects'),

    load: function(entity, args, callback) {
        GLUtil.userToken(args.userId, function(err, token) {
            if(err) return callback(err, []);

            GLUtil.client(token)[entity]
                .show(args.id, function(result) {
                    callback(null, result);
                });
        })
    },

    list: function(entity, id, callback) {
        GLUtil.userToken(id, function(err, token) {
            if(err) return callback(err, []);
        
            GLUtil.client(token)[entity]
                .all(function(results) {
                    callback(null, results);
                });
        })
    },

    create: function(entity, id, args, callback) {
        GLUtil.userToken(id, function(err, token) {
            if(err) return callback(err);
            
            GLUtil.client(token)[entity]
                .create(args.projectId, args, function(results) {
                    callback(null, results);
                });
        })
    }
};