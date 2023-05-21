const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');


const createToken = id => {

    //JWT Ref: https://github.com/auth0/node-jsonwebtoken
    return jwt.sign(
            {id: id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES}
    );
};

exports.signup = catchAsyncErrors(async(request, response, next) => {

    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirm: request.body.passwordConfirm
    });

    const token = createToken(newUser._id);

    response.status(201).json({
        status: 'success',
        message: "User Created Successfully",
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsyncErrors(async(request, response, next) => {

    const { email, password } = request.body;


    if (!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }

    //Verify email exists and password is correct
    const user = await User.findOne({ email: email }).select('+password'); //Passwords are not selected by default
            //console.log(user);

    if (!user || !(await user.verifyPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401));
    }

    //Send token to create
    const token = createToken(user._id);

    response.status(200).json({
        status: 'success',
        token,
        data: {}
    });
});