const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [50, 'Names are limited to 50 characters'],
        minlength: [1, 'Invalid name'],
        validate: {
            validator: function (el) {
                return /^[A-Za-z\s]+$/.test(el); //Require alpha characters only
            },
            message: "Invalid name"
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        maxlength: [50, 'Email addresses are limited to 50 characters'],
        minlength: [1, 'Invalid email address'],
        validate: [validator.isEmail, 'Invalid email address']
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    image: {
        type: String,
        default: 'default.jpg',
        maxlength: [250, 'Image names are limited to 250 characters']
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        maxlength: [50, 'Passwords are limited to 50 characters'],
        minlength: [8, 'Passwords must be at least 8 characters'],
        select: false //Prevents field from appearing in output
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //Note: This is only called on CREATE and SAVE calls
            validator: function (el) {
                return el === this.password; //Must match password value
            },
            message: "Passwords must match"
        }
    },
    passwordLastUpdated: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    }
});

/**
 * Encrypt passwords with bcrypt hashing algorithm
 * Note: runs before "save()" and "create()" commands
 */
userSchema.pre('save', async function (next) {

    //Only necessary if password was modified
    if (!this.isModified('password')){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12); //12 = Salt length
    this.passwordConfirm = undefined; //Will cause the field not to persist in the database
    next();
});

/**
 * Update password last updated timestamp on save/create events
 */
userSchema.pre('save', async function (next) {

    //Only necessary if password was modified or if user is being newly created
    if (!this.isModified('password') || this.isNew){
        return next();
    }

    this.passwordLastUpdated = Date.now() - 1000; //Ensure that token is created after timestamp here
    next();
});

/**
 * Limit all queries to active users only
 */
userSchema.pre('/^find/', async function (next) {

    this.find({active: { $ne : false }});
    next();
});


/**
 * Compare password input with encrypted user password.
 *
 * @param {string} input
 * @param {string} userPassword
 * @returns {Boolean}
 */
userSchema.methods.verifyPassword = async function(input, userPassword){
    return await bcrypt.compare(input, userPassword);
};

/**
 * Compare lest password change date time
 * @param {int} JWTTimestamp
 * @returns {Boolean}
 */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){

    if (this.passwordLastUpdated){
        const timestamp = parseInt(this.passwordLastUpdated.getTime() / 1000, 10);
        return JWTTimestamp < timestamp; //100 < 200
    }

    return false;
};

/**
 *
 * @returns {String}
 */
userSchema.methods.createPasswordResetToken = function(){

    let token = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

    this.passwordResetExpires = Date.now() + (1 * 60 * 1000); //Set to expire in 10 minutes

    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;