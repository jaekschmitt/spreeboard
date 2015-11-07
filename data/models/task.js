var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var taskSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    description: String,

    board: {
        type: Schema.ObjectId,
        required: true,
        ref: 'Board'
    },
    
    project: {
        type: Schema.ObjectId,
        ref: 'Project'
    },

    issue: {},
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

mongoose.model('Task', taskSchema);
