const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const Email = require('./../utils/email');
const AppError = require('./../utils/appError');

/**
 * Create new JSON Web Token
 * JWT Ref: https://github.com/auth0/node-jsonwebtoken
 *
 * @param {string} id
 * @return {void}
 */
const createToken = id => {

    return jwt.sign(
            {id: id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES}
    );
};

/**
 * @param {Object} user
 * @param {string} message
 * @param {int} statusCode
 * @param {Object} response
 * @return {void}
 */
const createAndSendToken = (user, message, statusCode, response) => {

    const token = createToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000)), //Set expiration to 90 days
        httpOnly: true
    };

    //Secure property will only work using HTTPS protocol. Ignore if not in production.
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    response.cookie('jwt', token, cookieOptions);

    //Unset the password in the response object
    if (user.password){
        user.password = undefined;
    }

    response.status(statusCode).json({
        status: 'success',
        message: message,
        token,
        data: {
            user: user
        }
    });

};

exports.signup = catchAsyncErrors(async(request, response, next) => {

    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirm: request.body.passwordConfirm,
        passwordLastUpdated: request.body.passwordLastUpdated
    });

    const url = `${request.protocol}://${request.get('host')}/account`;
    await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser, "User Created Successfully", 201, response);
});

exports.login = catchAsyncErrors(async(request, response, next) => {

    const {email, password} = request.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    //Verify email exists and password is correct
    const user = await User.findOne({email: email}).select('+password'); //Passwords are not selected by default

    if (!user || !(await user.verifyPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    //Send JWT token to client
    createAndSendToken(user, "User Signed In Successfully", 200, response);
});

exports.logout = catchAsyncErrors(async(request, response, next) => {

    response.cookie('jwt', 'logged_out', {
        expires: new Date(Date.now() + (10 * 1000)),
        httpOnly: true
    });

    response.status(200).json({
        status: 'success'
    });
});

exports.protected = catchAsyncErrors(async(request, response, next) => {

    let token;

    //Check if token exists
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
        token = request.headers.authorization.split(' ')[1];
    }
    else if (request.cookies.jwt){
        token = request.cookies.jwt;
    }

    //console.log("token: ", token);

    if (!token) {
        return next(new AppError('Please login to access this resource', 401));
    }

    //Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //console.log("decoded: ", decoded);

    //Ensure user associated with this token still exists (decoded.id = user.id)
    const currentUser = await User.findById(decoded.id);

    //console.log("user: ", currentUser);

    if (!currentUser) {
        return next(new AppError('Invalid token', 401));
    }

    //Ensure user password is still valid for this token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Invalid token.', 401));
    }

    //Proceed to protected route
    request.user = currentUser;
    response.locals.user = currentUser;
    next();
});

/**
 * Determine whether user is logged in. Rendered pages only.
 */
exports.isLoggedIn = async(request, response, next) => {

    //Check if token exists
    if (request.cookies.jwt){

        try {

            //Validate token
            const decoded = await promisify(jwt.verify)(request.cookies.jwt, process.env.JWT_SECRET);

            //console.log("decoded: ", decoded);

            //Ensure user associated with this token still exists (decoded.id = user.id)
            const currentUser = await User.findById(decoded.id);

            //console.log("user: ", currentUser);

            if (!currentUser) {
                return next();
            }

            //Ensure user password is still valid for this token
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            //Proceed to protected route
            response.locals.user = currentUser;
            return next();
        }
        catch (e){
            return next();
        }
    }

    next();
};

exports.restrictTo = (...roles) => {

    return (request, response, next) => {

        //roles: ['admin', 'user']
        if (!roles.includes(request.user.role)) {
            return next(new AppError('Insufficient permission to perform this action.', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsyncErrors(async(request, response, next) => {

    //Get user based on email
    const user = await User.findOne({email: request.body.email});

    if (!user) {
        return next(new AppError('User does not exist', 404));
    }

    //Generate random token to reset password
    let token = user.createPasswordResetToken();

    await user.save({
        validateBeforeSave: false
    });

    try {

        //Send to user via email
        const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/resetPassword/${token}`;

        const message = `Forgot your password? Reset here: ${resetURL}`;

        await new Email(
            user,
            resetURL
        ).sendPasswordReset();

        response.status(200).json({
            status: 'success',
            message: 'Password reset email sent'
        });
    } catch (err) {

        //If an error was encountered, remove the reset token from the user
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({
            validateBeforeSave: false
        });

        return next(new AppError('Whoops.. An error occurred sending the password reset email.', 500));
    }
});

exports.resetPassword = catchAsyncErrors(async(request, response, next) => {

    //Get user by given token
    const hashedToken = crypto
            .createHash('sha256')
            .update(request.params.token)
            .digest('hex');

    //Check token expiration (must be within 10 minutes of creation)
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now() - (1 * 60 * 1000)
        }
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired. Please try again.', 400));
    }

    //Update password-related properties for user
    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    //Log in user via JWT
    createAndSendToken(user, "Password Reset Successfully", 200, response);
});

exports.updatePassword = catchAsyncErrors(async(request, response, next) => {

    //Get user from collection
    const user = await User.findById(request.user.id).select('+password');

    //Ensure verified password is correct
    if (!(await user.verifyPassword(request.body.passwordCurrent, user.password))) {
        return next(new AppError('Current password is incorrect. Please enter your current password.', 400));
    }

    //Update password
    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;

    await user.save();

    //Send new JWT
    createAndSendToken(user, "Password Updated Successfully", 200, response);
});