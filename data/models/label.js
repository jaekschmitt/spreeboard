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

    server_info: {},

    created_at: {
        type: Date,
        required: true,
        default: new Date()
    },

    updated_at: {
        type: Date
    }

});

mongoose.model('Label', labelSchema);
