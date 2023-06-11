const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Require authentication for the routes below
router.use(authController.protected);

router.get('/account', userController.getCurrentUser, userController.getUserById);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateUserData', userController.updateUserData);
router.delete('/deleteCurrentUser', userController.deleteCurrentUser);

//Require admin roles for the routes below
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUserById)
    .delete(userController.deleteUserById);

module.exports = router;