var mongoose = require('mongoose');

var BoardSchema = new mongoose.Schema({

    name: { type: String, required: true },
    serverName: { type: String, required: true },

    stages: { type: Array },
    priorities: { type: Array },
    sizes: { type: Array },
    
    project: {},    
    created_by: {},
    created_at: {
        type: Date,
        required: true,
        default: new Date()
    },
    updated_at: {
        type: Date
    }

});

/**
* Hooks
*/

BoardSchema.pre('validate', function(next) {
    this.serverName = '(b) ' + this.name.toLowerCase().replace(' ', '-');
    next();
});


/**
* Schema Methods
*/

BoardSchema.methods = {    

};

BoardSchema.statics = {

    load: function(options, cb) {
        options.select = options.select || 'id title';

        var query = this.findOne(options.criteria)
            .select(options.select);

        query.exec(cb);
    }

};

mongoose.model('Board', BoardSchema);
