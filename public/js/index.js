import '@babel/polyfill';
import { login, logout } from './login';
import { register } from './register';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { launchReviewModal, closeReviewModal, saveReview } from './review';
import { displayAlert } from './alerts';

//MAPBOX
const mapBox = document.getElementById('map');

//TOURS
const bookTourBtn = document.getElementById('book-tour');
const lauchAddReview = document.getElementById('launch-review-modal');
const saveReviewBtn = document.getElementById('save-review');
const closeReview = document.querySelector('.close');

//LOGIN / LOGOUT
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const registerForm = document.querySelector('.form--register');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const alertMessage = document.querySelector('body').dataset.alert;

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (bookTourBtn) {

    bookTourBtn.addEventListener('click', e => {

        e.target.textContent = 'Processing...';
        e.target.disabled = true;

        const tourId = e.target.dataset.tourId;

        bookTour(tourId);
    });
}

if (lauchAddReview){
    lauchAddReview.addEventListener('click', e => {

        launchReviewModal();
    });
}

if (saveReviewBtn){
    saveReviewBtn.addEventListener('click', e => {

        e.preventDefault();

        const review = document.getElementById('review_text').value;
        const rating = document.getElementById('review_rating').value;
        const tourId = e.target.dataset.tourId;
        const slug = e.target.dataset.tourSlug;

        console.log(review, rating, tourId, slug);
        saveReview(review, rating, tourId, slug);
    });

    if (closeReview){

        closeReview.addEventListener('click', e => {
            closeReviewModal();
        });
    }
}

if (loginForm) {

    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (registerForm) {

    registerForm.addEventListener('submit', e => {
        e.preventDefault();

        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password_confirm').value;
        const role = document.getElementById('role');
        const roleVal = role.options[role.selectedIndex].value;

        register(firstName, lastName, email, password, passwordConfirm, roleVal);
    });
}

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('image', document.getElementById('image').files[0]);

        updateSettings(form, 'data');
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();

        document.querySelector('.btn--save-password').textContent = 'Updating..';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

        document.querySelector('.btn--save-password').textContent = 'Save Password';
    });
}


if (alertMessage) {
    displayAlert('success', alertMessage, 20);
}