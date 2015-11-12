var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TaskSchema = new Schema({

    title: {
        type: String,
        required: true
    },

    description: String,    

    board: {
        type: Schema.ObjectId,
        ref: 'Board'
    },
    
    stage: {},

    project: {
        type: Schema.ObjectId,
        ref: 'Project'
    },

    developer: { type: Schema.ObjectId, ref: 'User' },
    owner: { type: Schema.ObjectId, ref: 'User' },    
    created_by: { type: Schema.ObjectId, ref: 'User' },

    issue: {},

    created_at: {
        type: Date,
        required: true,
        default: new Date()
    },

    updated_at: {
        type: Date
    }

});

TaskSchema.statics = {

    load: function(options, cb) {
        options.select = options.select || 'id title description';
        
        var query = this.findOne(options.criteria)
            .select(options.select);    

        query.exec(cb);
    },

    list: function(options, cb) {
        options.criteria = options.criteria || {};
        options.select = options.select || 'id title stage';

        var query = this.find(options.criteria)
            .select(options.select);
        
        // these additions were deleting tasks? 
        // taking a look at it later

        // .populate('created_by', 'id name');

        // if(options.sort) query.sort(options.sort);
        // if(options.limit) query.limit(options.perPage);
        // if(options.limit && options.page) query.skip(options.perPage * options.page);

        query.exec(cb);
    },

    delete: function(options, cb) {
        this.findOneAndRemove(options.criteria)
            .exec(cb);
    }

};

mongoose.model('Task', TaskSchema);
