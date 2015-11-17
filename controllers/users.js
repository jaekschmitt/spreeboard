var logger = require('../config/logger'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.list = function(req, res, next) {
    var options = {
        select: 'id name email'
    };

    User.list(options, function(err, users){ 
        if(err) return res.status(500).json(err);
        res.status(200).json(users);
    });
};