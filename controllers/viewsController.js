const Tour = require('./../models/tourModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');

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

    response
        .status(200)
//        .set(
//            'Content-Security-Policy',
//            'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com'
//        )
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