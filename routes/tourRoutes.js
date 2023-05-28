const express = require('express');
const authController = require('./../controllers/authController');
const tourController = require('./../controllers/tourController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

//router.param('id', tourController.checkId);

router.route('/top-5-bargain-tours')
        .get(tourController.aliasTopBargainTours, tourController.getAllTours);

router.route('/tour-stats')
        .get(tourController.getTourStats);

router.route('/monthly-plan/:year')
        .get(tourController.getMonthlyPlan);

router.route('/')
        .get(authController.protected, tourController.getAllTours) //
        .post(tourController.createTour);

router.route('/:id')
        .get(tourController.getTourById)
        .patch(tourController.updateTourById)
        .delete(
                authController.protected,
                authController.restrictTo('admin', 'lead-guide'),
                tourController.deleteTourById
                );

//Redirect to Review Router: GET /tour/123456/reviews
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;