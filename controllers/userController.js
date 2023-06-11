const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

/**
 *
 * @param {type} obj
 * @param {type} allowedFields
 * @returns {Object}
 */
filterObject = (obj, ...allowedFields) => {

    let newObj = {};

    Object.keys(obj).forEach( el => {
        if (allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.updateUserData = catchAsyncErrors( async (request, response, next) => {

    //Create error if user POSTs password data
    if (request.body.password || request.body.passwordConfirm){
        return next(new AppError('Passwords not allowed in this route. Please use /updatePassword.', 400));
    }

    //Update user - only allow certain fields to be updated
    const filteredBody = filterObject(request.body, 'name', 'email');

    const user = await User.findByIdAndUpdate(request.user.id, filteredBody, {new: true, runValidators: true});

    response
            .status(200)
            .json({
                status: "success",
                data : {
                    user: user
                }
            });
});

exports.deleteCurrentUser = catchAsyncErrors(async (request, response, next) => {

    const user = await User.findByIdAndUpdate(
            request.user.id,
            {active: false}
    );

    response
            .status(204)
            .json({
                status: "success",
                data: null
            });
});

exports.getCurrentUser = (request, response, next)=> {
    request.params.id = request.user.id;
    next();
};

exports.getAllUsers = factory.getAllDocuments(User);
exports.getUserById = factory.getDocument(User);
exports.updateUserById = factory.updateDocument(User);
exports.deleteUserById = factory.deleteDocument(User);