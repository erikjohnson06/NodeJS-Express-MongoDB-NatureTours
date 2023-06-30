import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { displayAlert } from './alerts';

//MAPBOX
const mapBox = document.getElementById('map');

//TOURS
const bookTourBtn = document.getElementById('book-tour');

//LOGIN / LOGOUT
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const alertMessage = document.querySelector('body').dataset.alert;

if (mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (bookTourBtn){

    bookTourBtn.addEventListener('click', e => {

        e.target.textContent = 'Processing...';

        const tourId = e.target.dataset.tourId;

        bookTour(tourId);
    });
}

if (loginForm){

    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

if (logoutBtn){
    logoutBtn.addEventListener('click', logout);
}

if (userDataForm){
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('image', document.getElementById('image').files[0]);

        updateSettings(form, 'data');
    });
}

if (userPasswordForm){
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


if (alertMessage){
    displayAlert('success', alertMessage, 20);
}