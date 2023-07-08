import axios from 'axios';
import { displayAlert } from './alerts';

export const launchReviewModal = () => {
    document.querySelector('.review-modal').style.display = 'block';
};

export const closeReviewModal = () => {
    document.querySelector('.review-modal').style.display = 'none';
};

/**
 * @param {String} review
 * @param {Int} rating
 * @param {String} tour
 * @param {String} slug
 * @returns {void}
 */
export const saveReview = async (review, rating, tour, slug) => {

    try {

        //Perform some basic validation before attempting to save
        if (!review) {
            throw "Please leave a review!";
        }

        rating = parseInt(rating);

        if (rating < 1 || rating > 5) {
            throw "Rating must be between 1 (lowest) and 5 (highest)";
        }

        if (!tour) {
            throw "Invalid Tour";
        }

        const result = await axios({
            method: 'POST',
            url: '/api/v1/reviews',
            data: {
                review: review,
                rating: rating,
                tour: tour
            }
        });

        closeReviewModal();

        if (typeof (result.data.status) !== 'undefined' && result.data.status === 'success') {

            displayAlert('success', 'Thanks for sharing your review!');

            window.setTimeout(() => {
                location.assign(`/tour/${slug}`);
            }, 1500);
        } else {
            throw "Whoops.. an unexpected error has occurred.";
        }
    } catch (e) {

        if (typeof (e.response) !== 'undefined') {
            displayAlert('error', e.response.data.message);
        } else {
            displayAlert('error', e);
        }
    }
};
