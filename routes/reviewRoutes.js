const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({
    mergeParams: true //Allows access to parameters from tour routers
});


router.route('/')
        .get(reviewController.getAllReviews)
        .post(
                authController.protected,
                authController.restrictTo('user'),
                reviewController.setTourAndUserIds,
                reviewController.createReview
                );

router.route('/:id')
        .get(reviewController.getReviewById)
        .patch(reviewController.updateReviewById)
        .delete(
                authController.protected,
                authController.restrictTo('admin'),
                reviewController.deleteReviewById
                );

module.exports = router;