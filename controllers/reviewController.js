
const Review = require('./../models/reviewModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');

exports.getAllReviews = catchAsyncErrors(async (request, response, next) => {

    const reviews = await Review.find();

    response
            .status(200)
            .json({
                status: "success",
                results: reviews.length,
                data: {
                    reviews: reviews
                }
            });
});

exports.createReview = catchAsyncErrors(async (request, response, next) => {

    //Allowing for nested routes form URL
    if (!request.body.tour){
        request.body.tour = request.params.tourId;
    }

    if (!request.body.user){
        request.body.user = request.user.id;
    }

    const review = await Review.create(request.body);

    response
            .status(201)
            .json({
                status: "success",
                message: "Review Created Successfully",
                data: {
                    review: review
                }
            });
});