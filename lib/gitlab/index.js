var config = require(__base + 'config'),
    GLUtil = require('./utils'),
    request = require('request');

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
    },

    destroy: function(entity, id, args, callback) {
        var url = config.gitlab.api + '/projects/' + args.projectId + '/' + entity,
            body = { name: args.name };

        GLUtil.userToken(id, function(err, token) {
            if(err) return callback(err);

            request({
                method: 'DELETE',
                url: url,
                headers: { 'PRIVATE-TOKEN' : token },
                json: body
            }, function(err, response, body) {
                if(err) {
                    callback(err);  
                } else if ([200, 201].indexOf(response.statusCode) < 0) {                
                    callback(new Error("Error communicating with Gitlab server"));
                } else {
                    callback(null, true);                
                }
            });
        })
    }
};