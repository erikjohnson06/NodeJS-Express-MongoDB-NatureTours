const express = require('express');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

router.route('/top-5-bargain-tours')
        .get(tourController.aliasTopBargainTours, tourController.getAllTours);

router.route('/tour-stats')
        .get(tourController.getTourStats);

router.route('/monthly-plan/:year')
        .get(
                authController.protected,
                authController.restrictTo('admin', 'lead-guide', 'guide'),
                tourController.getMonthlyPlan
                );

router.route('/tours-within/:distance/center/:latlong/unit/:unit')
        .get(tourController.getToursWithinDistance);

router.route('/calculate-distances/:latlong/unit/:unit')
        .get(tourController.getDistanceToTourStartingPoints);

router.route('/')
        .get(tourController.getAllTours) //
        .post(
                authController.protected,
                authController.restrictTo('admin', 'lead-guide'),
                tourController.createTour
                );

router.route('/:id')
        .get(tourController.getTourById)
        .patch(
                authController.protected,
                authController.restrictTo('admin', 'lead-guide'),
                tourController.uploadTourImages,
                tourController.resizeTourImages,
                tourController.updateTourById)
        .delete(
                authController.protected,
                authController.restrictTo('admin', 'lead-guide'),
                tourController.deleteTourById
                );

//Redirect to Review Router: GET /tour/123456/reviews
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;