var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var labelSchema = new Schema({

    name: {
        type: String,
        required: true
    },

    board: {
        type: Schema.ObjectId,
        required: true,
        ref: 'Board'
    },

    type: {
        type: String,
        required: true,
        enum: ['board', 'stage', 'label']
    },

    created_at: {
        type: Date,
        required: true,
        default: new Date()
    },

    updated_at: {
        type: Date
    }

});

labelSchema
    .virtual('serverName')
    .get(function() {
        return '(s) ' + this.name.toLowerCase().replace(' ', '-');
    });

mongoose.model('Label', labelSchema);
