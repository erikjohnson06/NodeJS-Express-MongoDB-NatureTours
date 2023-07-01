const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const Email = require('../utils/email');
const factory = require('./handlerFactory');

/**
 * Return a date string for use in confirmation code
 *
 * @returns {String}
 */
const getBookingDateString = () => {

    let d = new Date();
    return d.getFullYear().toString() + (d.getMonth() + 1).toString() + d.getDate().toString();
};

exports.getCheckoutSession = catchAsyncErrors(async (request, response, next) => {

    //Get tour by Id
    const tour = await Tour.findById(request.params.tourId);

    //Create a confirmation code for added security
    const conf = crypto
            .createHash('sha256')
            .update(tour.id + request.user.id + getBookingDateString())
            .digest('hex')
            .slice(0, 10); //Use the first 10 characters as the confirmation code

    //Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${request.protocol}://${request.get('host')}/booking/checkout-complete/${request.params.tourId}/u_id/${request.user.id}/conf/${conf}`,
        cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}?alert=error`,
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

    try {

        const {t_id, u_id, conf} = request.params;

        if (!t_id || !u_id) {
            throw "An unexpected error has occurred. Unable to book tour";
        }

        //Re-create confirmation code for added security
        const conf_test = crypto
                .createHash('sha256')
                .update(t_id + u_id + getBookingDateString())
                .digest('hex')
                .slice(0, 10);

        if (conf !== conf_test) {
            throw "An unexpected validation error has occurred. Unable to complete booking process";
        }

        const tour = await Tour.findById(t_id);
        const user = await User.findById(u_id);

        if (!tour || !user) {
            throw "An unexpected error has occurred. Unable to complete booking process";
        }

        //Save the booking locally
        await Booking.create({tour: tour.id, user: user.id, price: tour.price, confirmation: conf});

        const url = `${request.protocol}://${request.get('host')}/my-tours`;

        await (new Email(
                user,
                url,
                {
                    tourName: tour.name,
                    tourPrice: tour.price.toLocaleString('en-US'),
                    confirmationCode: conf
                }))
                .sendBookingConfirmation();

        //Redirect back to the bookings page with a confirmation message
        response.redirect('/my-tours?alert=booking&confirmation=' + conf);
    } catch (e) {
        response.status(500).json({
            status: 'error',
            message: e
        });
    }
});

/**
 * CRUD Operations
 */
exports.createBooking = factory.createDocument(Booking);
exports.getAllBookings = factory.getAllDocuments(Booking);
exports.getBookingById = factory.getDocument(Booking);
exports.updateBookingById = factory.updateDocument(Booking);
exports.deleteBookingById = factory.deleteDocument(Booking);