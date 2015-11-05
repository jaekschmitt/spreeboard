var mongoose = require('mongoose');

var boardSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    
    created_at: {
        type: Date,
        required: true
    },

    updated_at: {
        type: Date
    }

});

mongoose.model('Board', boardSchema);
