var mongoose = require('mongoose');

var priorityLevelSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    importance: {
        type: Number
    },

    created_at: {
        type: Date,
        required: true
    },

    updated_at: {
        type: Date
    }

});

mongoose.model('PriorityLevel', priorityLevelSchema);
