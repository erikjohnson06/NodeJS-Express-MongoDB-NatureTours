const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        maxlength: [50, 'Names are limited to 50 characters'],
        minlength: [1, 'Invalid name']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        maxlength: [250, 'Email addresses are limited to 250 characters'],
        validate: [validator.isEmail, 'Invalid email address']
    },
    image: {
        type: String,
        default: "",
        maxlength: [250, 'Image names are limited to 250 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        maxlength: [50, 'Passwords are limited to 50 characters'],
        minlength: [8, 'Passwords must be at least 8 characters']
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
    }
});

//Middleware: runs before "save()" and "create()" commands
//Encrypt passwords with bcrypt hashing algorithm
userSchema.pre('save', async function (next) {

    //Only necessary if password was modified
    if (!this.isModified('password')){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12); //12 = Salt length
    this.passwordConfirm = undefined; //Will cause the field not to persist in the database
    next();
});

/*
{
    //Options
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
 */
const User = mongoose.model('User', userSchema);

module.exports = User;