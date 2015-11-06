var mongoose = require('mongoose');

var boardSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    project: {},
    
    created_at: {
        type: Date,
        required: true,
        default: new Date()
    },

    updated_at: {
        type: Date
    }

});

mongoose.model('Board', boardSchema);
