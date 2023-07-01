import axios from 'axios';
import { displayAlert } from './alerts';

/**
 * @param {String} first_name
 * @param {String} last_name
 * @param {String} email
 * @param {String} password
 * @param {String} passwordConfirm
 * @param {String} role
 * @returns {void}
 */
export const register = async (first_name, last_name, email, password, passwordConfirm, role) => {

    try {

        //Perform some basic validation before attempting to save
        if (!first_name || !last_name) {
            throw "First and Last Name is required";
        } else if (!email) {
            throw "Email address is required";
        } else if (!password || !passwordConfirm) {
            throw "Please specify a password";
        } else if (password !== passwordConfirm) {
            throw "Passwords do not match. Please try again.";
        } else if (password.length < 8) {
            throw "Passwords must be a minimum of 8 characters.";
        }

        const result = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name: first_name + ' ' + last_name,
                email: email,
                password: password,
                passwordConfirm: passwordConfirm,
                role: role
            }
        });

        if (!result || typeof (result.data) === 'undefined' || result.data.status !== 'success') {

            //11000 = Duplicate field value error
            if (typeof (result.data.message.code) !== 'undefined' && result.data.message.code === 11000) {
                throw "This email address is already in use. Please specify another email. "
            }
            //Validation errors
            else if (typeof (result.data.message.errors) !== 'undefined') {
                let field = Object.keys(result.data.message.errors);
                throw result.data.message.errors[field].message;
            } else {
                throw "Whoops.. an unexpected error has occurred.";
            }
        }

        displayAlert('success', 'Account Created successfully!');
        window.setTimeout(() => {
            location.assign('/');
        }, 1500);

    } catch (e) {

        if (typeof (e.response) !== 'undefined') {
            displayAlert('error', e.response.data.message);
        } else {
            displayAlert('error', e);
        }
    }
};
