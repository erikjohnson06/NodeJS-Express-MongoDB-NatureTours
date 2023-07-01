import axios from 'axios';
import { displayAlert } from './alerts';

export const register = async (first_name, last_name, email, password, passwordConfirm, role) => {


    console.log(first_name, last_name, email, password, passwordConfirm, role);

    try {

        //Perform some basic validation before attempting to save
        if (!first_name || !last_name){
            throw "First and Last Name is required";
        }
        else if (!email){
            throw "Email address is required";
        }
        else if (!password || !passwordConfirm){
            throw "Please specify a password";
        }
        else if (password !== passwordConfirm){
            throw "Passwords do not match. Please try again.";
        }
        else if (password.length < 8){
            throw "Passwords must be a minimum of 8 characters.";
        }

        const name = first_name + ' ' + last_name;

        const result = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name: name,
                email: email,
                password: password,
                passwordConfirm: passwordConfirm,
                role: role
            }
        });

        console.log(result);

        if (result.data.status === 'success') {
            displayAlert('success', 'Account Created successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
        else {

            //11000 = Duplicate field value error
            if (typeof (result.data.message.code) && result.data.message.code === 11000){
                throw "This email address is already in use. Please specify another email. "
            }
            
        }
    } catch (e) {

        console.log(e, typeof (e.response));

        if (typeof (e.response) !== 'undefined'){
            displayAlert('error', e.response.data.message);
        }
        else {
            displayAlert('error', e);
        }
    }
};
