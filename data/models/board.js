var mongoose = require('mongoose');

var BoardSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    project: {},
    stages: {
        type: Array,
        required: true
    },

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
* Virtuals
*/

BoardSchema
    .virtual('labelName')
    .get(function() {
        return '(b) ' + this.name.toLowerCase().replace(' ', '-');
    });

/**
* Schema Methods
*/

BoardSchema.methods = {    

};

mongoose.model('Board', BoardSchema);
