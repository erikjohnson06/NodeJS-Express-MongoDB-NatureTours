import axios from 'axios';
import { displayAlert } from './alerts';

export const bookTour = async tourId => {

    try {

        const stripe = Stripe('pk_test_51NLNugLD9diXR5pVy6RQScVwINTtYdK6HUvs5SiK2diPloqQSkrTlhCr3EJpRJ2EFbdtZQniE1iJSpQz2ojcqWQJ00wZhT9fED');

        //Get session from server
        const session = await axios({
                method: 'GET',
                url: `/api/v1/booking/checkout-session/${tourId}`
        });

        //Create checkout form
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    }
    catch (e){
        console.error(e);
        displayAlert('error', e);
    }
};

