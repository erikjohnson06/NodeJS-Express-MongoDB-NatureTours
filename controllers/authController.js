const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');

exports.signup = catchAsyncErrors(async(request, response, next) => {

    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirm: request.body.passwordConfirm
    });

    //Ref: https://github.com/auth0/node-jsonwebtoken
    const token = jwt.sign(
            {id: newUser._id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES}
    );

    response.status(201).json({
        status: 'success',
        message: "User Created Successfully",
        token,
        data: {
            user: newUser
        }
    });
});