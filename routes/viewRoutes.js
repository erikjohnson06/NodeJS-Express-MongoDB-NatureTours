const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

router.use(viewsController.alerts);

router.get(
    '/booking/checkout-complete/:t_id/u_id/:u_id/conf/:conf',
    authController.protected,
    bookingController.createBookingCheckout
);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTourDetail);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/register', authController.isLoggedIn, viewsController.getRegistrationForm);
router.get('/account', authController.protected, viewsController.getAccount);
router.get('/my-tours', authController.protected, viewsController.getMyTours);

router.get('/update-user-data', authController.protected, viewsController.updateUserData);

module.exports = router;

