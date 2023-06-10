const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsyncErrors(async (request, response, next) => {

    //Get Tour data
    const tours = await Tour.find();

    //Build and render template


    response.status(200).render('overview', {
        title: 'All Tours',
        tours: tours
    });
});

exports.getTourDetail = catchAsyncErrors(async (request, response, next) => {

    const tour = await Tour.findOne({
        slug: request.params.slug
    }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour){
        return next(new AppError("Sorry.. That tour was not found", 404));
    }

    response
        .status(200)
        .render('tour', {
            title: tour.name,
            tour: tour
        });
});

exports.getLoginForm = (request, response) => {
    response
        .status(200)
//        .set(
//            'Content-Security-Policy',
//            'connect-src https://cdnjs.cloudflare.com'
//        )
        .render('login', {
            title: 'Login to Your Account'
        });
};

exports.getAccount = catchAsyncErrors(async (request, response, next) => {

    response.status(200).render('account', {
        title: 'My Account'
    });
});

exports.updateUserData = catchAsyncErrors(async (request, response, next) => {

    console.log("updateUserData: ", request.body);

    const user = await User.findByIdAndUpdate(request.user.id, {
        name: request.body.name,
        email: request.body.email
    }, {
        new: true,
        runValidators: true
    });

    response.status(200).render('account', {
        title: 'My Account',
        user: user
    });
});
