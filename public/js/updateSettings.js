import axios from 'axios';
import { displayAlert } from './alerts';

/**
 *
 * @param {Obj} data
 * @param {Strgng} type
 * @returns {void}
 */
export const updateSettings = async (data, type) => {

    try {

        const url = (type === 'password') ?
            'http://localhost:3000/api/v1/users/updatePassword' :
            'http://localhost:3000/api/v1/users/updateUserData';

        const result = await axios({
            method: 'PATCH',
            url: url,
            data: data
        });

        console.log(result);

        if (result.data.status === 'success'){
            displayAlert('success',`${type.toUpperCase()} updated successfully`);
        }
    }
    catch (e){
        displayAlert('error', e.response.data.message);
    }
};