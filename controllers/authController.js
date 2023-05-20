const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');

exports.signup = catchAsyncErrors(async(request, response, next) => {
    
    console.log(request.body);

    const newUser = await User.create(request.body);

    response.status(201).json({
        status: 'success',
        message: "User Created Successfully",
        data: {
            user: newUser
        }
    });
});