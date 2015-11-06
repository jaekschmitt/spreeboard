var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;
var oAuthTypes = [
'gitlab'
];

/**
* User Schema
*/

var UserSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    roles: { type: Array, default: ['user'] },
    provider: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    authToken: { type: String, default: '' },
    gitlab: {},
});

/**
* Virtuals
*/

UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password });

/**
* Validations
*/

var validatePresenceOf = function (value) {
    return value && value.length;
};


UserSchema.path('name').validate(function (name) {
    if (this.skipValidation()) return true;
    return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate(function (email) {
    if (this.skipValidation()) return true;
    return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate(function (email, fn) {
    var User = mongoose.model('User');
    if (this.skipValidation()) fn(true);

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
        User.find({ email: email }).exec(function (err, users) {
            fn(!err && users.length === 0);
        });
    } else fn(true);
}, 'Email already exists');

UserSchema.path('hashed_password').validate(function (hashed_password) {
    if (this.skipValidation()) return true;
    return hashed_password.length && this._password.length;
}, 'Password cannot be blank');

UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.password) && !this.skipValidation()) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
})

/**
* Schema Methods
*/

UserSchema.methods = {

    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto
            .createHmac('sha1', this.salt)
            .update(password)
            .digest('hex');
        } catch (err) {
            return '';
        }
    },

    /**
    * Validation is not required if using OAuth
    */

    skipValidation: function() {
        return ~oAuthTypes.indexOf(this.provider);
    }
};

/**
* Class Methods
*/

UserSchema.statics = {

    load: function (options, cb) {
        options.select = options.select || 'name';
        this.findOne(options.criteria)
        .select(options.select)
        .exec(cb);
    }
}

mongoose.model('User', UserSchema);