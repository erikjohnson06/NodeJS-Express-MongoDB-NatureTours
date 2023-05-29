const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword', authController.protected, authController.updatePassword);

router.get('/me', authController.protected, userController.getCurrentUser, userController.getUserById);
router.patch('/updateCurrentUserData', authController.protected, userController.updateCurrentUserData);
router.delete('/deleteCurrentUser', authController.protected, userController.deleteCurrentUser);

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUserById)
    .delete(userController.deleteUserById);

module.exports = router;