const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsyncErrors(async (request, response, next) => {

    //Get tour by Id
    const tour = await Tour.findById(request.params.tourId);
    const conf = tour.id + request.user.id + ;

    //Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url:`${request.protocol}://${request.get('host')}/booking/checkout-complete/${request.params.tourId}/u_id/${request.user.id}/conf/${conf}`, //&price=${tour.price}
        cancel_url:`${request.protocol}://${request.get('host')}/tour/${tour.slug}?alert=error`,
        customer_email: request.user.email,
        client_reference_id: request.params.tourId,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100, //Stripe expects amount to be in cents
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: []
                    }
                }
            }
        ],
        mode: 'payment'
    });

    response.status(200).json({
        status: 'success',
        session: session
    });
});

exports.createBookingCheckout = catchAsyncErrors(async (request, response, next) => {

    //console.log(request.user);

    try {

//        const t_id = request.params.t_id;
//        const u_id = request.params.u_id;

        const { t_id, u_id } = request.params;

        console.log("t_id: ", t_id);
        console.log("u_id: ", u_id);


        if (!t_id && !u_id) {
            throw "An unexpected error has occurred. Unable to book tour";
        }

        const tour = await Tour.findById(t_id);
        const user = await User.findById(u_id);

        console.log("tour: ", tour);
        console.log("user: ", user);

        if (!tour || !user){
            throw "An unexpected error has occurred. Unable to book tour";
        }

        await Booking.create({ tour: tour.id, user: user.id, price: tour.price });

        //Redirect back to the homepage without the query string
        //response.redirect(request.originalUrl.split('?')[0]);
        response.redirect('/my-tours?alert=booking');
    }
    catch (e){
        response.status(500).json({
            status: 'error',
            message: e
        });
    }
});

exports.createBooking = factory.createDocument(Booking);
exports.getAllBookings = factory.getAllDocuments(Booking);
exports.getBookingById = factory.getDocument(Booking);
exports.updateBookingById = factory.updateDocument(Booking);
exports.deleteBookingById = factory.deleteDocument(Booking);