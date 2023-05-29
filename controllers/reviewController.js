const Review = require('./../models/reviewModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const factory = require('./handlerFactory');

exports.setTourAndUserIds = catchAsyncErrors(async (request, response, next) => {

    //Allowing for nested routes form URL
    if (!request.body.tour){
        request.body.tour = request.params.tourId;
    }

    if (!request.body.user){
        request.body.user = request.user.id;
    }

    next();
});

exports.getAllReviews = factory.getAllDocuments(Review);
exports.getReviewById = factory.getDocument(Review);
exports.createReview = factory.createDocument(Review);
exports.updateReviewById = factory.updateDocument(Review);
exports.deleteReviewById = factory.deleteDocument(Review);