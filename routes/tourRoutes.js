const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
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
        .delete(tourController.deleteTourById);

module.exports = router;