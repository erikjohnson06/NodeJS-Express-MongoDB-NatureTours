const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');

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

exports.getAllUsers = catchAsyncErrors( async (request, response, next) => {

    const users = await User.find();

    response
            .status(200)
            .json({
                status: "success",
                results: users.length,
                data: {
                    users: users
                }
            });
});

exports.updateCurrentUserData = catchAsyncErrors( async (request, response, next) => {

    //Create error if user POSTs password data
    if (request.body.password || request.body.passwordConfirm){
        return next(new AppError('Passwords not allowed in this route. Please use /updatePassword.', 400));
    }

    //Update user - only allow certain fields to be updated
    const filteredBody = filterObject(request.body, 'name', 'email');

    console.log("filteredBody", filteredBody);

    const user = await User.findByIdAndUpdate(request.user.id, filteredBody, {new: true, runValidators: true});

    console.log("user", user);

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

exports.createUser = (request, response) => {

    response
            .status(500)
            .json({
                status: "error",
                message: "Route not yet defined"
            });
};

exports.getUserById = (request, response) => {

    response
            .status(500)
            .json({
                status: "error",
                message: "Route not yet defined"
            });
};

exports.updateUserById = (request, response) => {

    response
            .status(500)
            .json({
                status: "error",
                message: "Route not yet defined"
            });
};

//exports.deleteUserById = (request, response) => {
//
//    response
//            .status(500)
//            .json({
//                status: "error",
//                message: "Route not yet defined"
//            });
//};

exports.deleteUserById = handlerFactory.deleteOne(User);