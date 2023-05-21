const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');

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

exports.deleteUserById = (request, response) => {

    response
            .status(500)
            .json({
                status: "error",
                message: "Route not yet defined"
            });
};