const express = require('express');
const viewsController = require('./../controllers/viewsController');
const router = express.Router();

//router.get('/', (request, response) => {
//    response.status(200).render('base', {
//        title: 'Adventures at the Next Level',
//        tour: 'The Forest Hiker',
//        user: 'Erik'
//    });
//});

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTourDetail);

module.exports = router;