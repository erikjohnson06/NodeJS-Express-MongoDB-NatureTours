const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');

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
        .render('login', {
            title: 'Login to Your Account'
        });
};

exports.getAccount = (request, response) => {

    response.status(200).render('account', {
        title: 'My Account'
    });
};

exports.getMyTours = catchAsyncErrors(async (request, response, next) => {

    //Get all user bookings
    const bookings = await Booking.find({ user : request.user.id });
    let tours = [];

    if (bookings){
        const tourIds = bookings.map(el => el.tour);
        tours = await Tour.find({ _id: { $in : tourIds }});
    }

    response.status(200).render('overview', {
        title: 'My Tours',
        tours: tours
    });
});

exports.updateUserData = catchAsyncErrors(async (request, response, next) => {

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

exports.alerts = (request, response, next) => {

    const { alert } = request.query;

    if (alert){

        switch (alert){
            case 'booking':
                response.locals.alert = 'Booking was successful! An order confirmation has been sent to your email.';
                break;
            case 'error':
                response.locals.alert = 'Hmm.. Something went wrong. If this issue persists, please contact an administrator.';
                break;
        }
    }

    next();
};
