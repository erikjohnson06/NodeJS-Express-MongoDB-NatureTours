import axios from 'axios';
import { displayAlert } from './alerts';

export const login = async (email, password) => {

    try {
        const result = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });

        if (result.data.status === 'success') {
            displayAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (e) {
        displayAlert('error', e.response.data.message);
    }
};

export const logout = async () => {

    try {

        const result = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });

        if (result.data.status === 'success') {

            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (e) {
        displayAlert('error', 'An error occurred logging out. Please try again. ');
    }
};