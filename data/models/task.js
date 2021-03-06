var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash');

var TaskSchema = new Schema({

    title: { type: String, required: 'Title cannot be blank' },
    description: String,
    
    stage: {},
    priority: {},
    size: {},

    board: { type: Schema.ObjectId, ref: 'Board' },
    project: { type: Schema.ObjectId, ref: 'Project' },

    developer: { type: Schema.ObjectId, ref: 'User' },
    owner: { type: Schema.ObjectId, ref: 'User' },
    created_by: { type: Schema.ObjectId, ref: 'User' },
    approved: { type: Boolean, default: false },

    issue: {},
    sync_lock: {
        type: Boolean,
        default: false
    },

    created_at: {
        type: Date,
        required: true,
        default: new Date()
    },

    updated_at: {
        type: Date
    },

    status: {
        type: String,
        required: true,
        enum: ['active', 'closed', 'completed'],
        default: 'active'
    },

    last_status_update: {
        type: Date,
        default: new Date()
    }

});

TaskSchema.statics = {

    load: function(options, cb) {
        options.select = options.select || 'id title description';        

        var query = this.findOne(options.criteria)
            .select(options.select);    

        if(options.populate) {
            var populate = options.populate;
            
            for(var key in populate) {
                if(populate.hasOwnProperty(key)) {                    
                    query.populate(key, populate[key]);
                }
            }
        }

        query.exec(cb);
    },

    list: function(options, cb) {
        options.criteria = options.criteria || {};
        options.select = options.select || 'id title stage';        

        var query = this.find(options.criteria)
            .select(options.select);
        
        if(options.populate) {
            var populate = options.populate;
            
            for(var key in populate) {
                if(populate.hasOwnProperty(key)) {                    
                    query.populate(key, populate[key]);
                }
            }
        }

        query.exec(cb);
    },

    delete: function(options, cb) {
        this.findOneAndRemove(options.criteria)
            .exec(cb);
    }

};

module.exports = {
    name: 'Task',
    schema: mongoose.model('Task', TaskSchema)
};