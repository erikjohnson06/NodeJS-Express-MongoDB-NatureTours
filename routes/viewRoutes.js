const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const router = express.Router();

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTourDetail);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/account', authController.protected, viewsController.getAccount);

router.get('/update-user-data', authController.protected, viewsController.updateUserData);

module.exports = router;