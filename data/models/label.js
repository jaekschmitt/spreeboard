var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LabelSchema = new Schema({

    name: { type: String, default: '' },
    serverName: { type: String },
    color: { type: String },

    board: {
        type: Schema.ObjectId,
        required: true,
        ref: 'Board'
    },

    type: {
        type: String,
        required: true,
        enum: ['board', 'stage', 'priority', 'size', 'label']
    },

    created_at: {
        type: Date,
        required: true,
        default: new Date()
    },

    updated_at: { type: Date }

});

/**
* Validations
*/

LabelSchema.path('name').validate(function(name) {
    return name.length;
}, 'Name cannot be blank');

LabelSchema.pre('save', function(next) {    
    switch(this.type) {
        case 'board':
            this.serverName = '(b) ' + this.name.toLowerCase().replace(' ', '-');
            break;
        case 'stage':
            this.serverName = '(s) ' + this.name.toLowerCase().replace(' ', '-');
            break;
        case 'priority':
            this.serverName = '(p) ' + this.name.toLowerCase().replace(' ', '-');
            break;
        case 'size':
            this.serverName = '(sz) ' + this.name.toLowerCase().replace(' ', '-');
            break;
        default:
            this.serverName = this.name.toLowerCase();            
    }

    next();
});

/**
* Methods
*/

LabelSchema.methods = {

    generateServerName: function() {
        switch(this.type) {
            case 'board':
                this.serverName = '(b) ' + this.name.toLowerCase().replace(' ', '-');
                break;
            case 'stage':
                this.serverName = '(s) ' + this.name.toLowerCase().replace(' ', '-');
                break;
            case 'priority':
                this.serverName = '(p) ' + this.name.toLowerCase().replace(' ', '-');
                break;
            case 'size':
                this.serverName = '(sz) ' + this.name.toLowerCase().replace(' ', '-');
                break;
            default:
                this.serverName = this.name.toLowerCase();            
        }

        return this.serverName;
    }

};

LabelSchema.statics = {

    load: function(options, cb) {
        options.select = options.select || 'name serverName color';

        this.findOne(options.criteria)
            .select(options.select)
            .exec(cb);
    },

    list: function(options, cb) {
        options.criteria = options.criteria || {};
        options.select = options.select || 'name serverName';

        this.find(options.criteria)
            .select(options.select)
            .exec(cb);
    },

    delete: function(options, cb) {
        this.findOneAndRemove(options.criteria)
            .exec(cb);
    }

};

module.exports = {
    name: 'Label',
    schema: mongoose.model('Label', LabelSchema)
};