import axios from 'axios';
import { displayAlert } from './alerts';

export const login = async (email, password) => {

    try {
        const result = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });

        console.log(result);

        if (result.data.status === 'success'){
            displayAlert('success','Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    }
    catch (e){
        displayAlert('error', e.response.data.message);
    }
};

export const logout = async () => {

    try {

        const result = await axios({
            method: 'GET',
            url: 'http://localhost:3000/api/v1/users/logout'
        });

        console.log(result);

        if (result.data.status === 'success'){
            location.reload(true); //'true' required here to force reload from server vs cache
        }
    }
    catch(e){
        displayAlert('error', 'An error occurred logging out. Please try again. ');
    }
};