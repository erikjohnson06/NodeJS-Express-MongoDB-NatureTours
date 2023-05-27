const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.route('/')
        .get(reviewController.getAllReviews)
        .post(authController.protected, authController.restrictTo('user'), reviewController.createReview);


module.exports = router;