const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const factory = require('./handlerFactory');


exports.getCheckoutSession = catchAsyncErrors(async (request, response, next) => {

    //Get tour by Id
    const tour = await Tour.findById(request.params.tourId);

    //console.log("slug: ", tour.slug);

    //Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url:`${request.protocol}://${request.get('host')}/?tour=${request.params.tourId}&user=${request.user.id}&price=${tour.price}`,
        cancel_url:`${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
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
    const { tour, user, price } = request.query;

    if (!tour && !user && !price) {
        return next();
    }

    await Booking.create({ tour, user, price });

    //Redirect back to the homepage without the query string
    response.redirect(request.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createDocument(Booking);
exports.getAllBookings = factory.getAllDocuments(Booking);
exports.getBookingById = factory.getDocument(Booking);
exports.updateBookingById = factory.updateDocument(Booking);
exports.deleteBookingById = factory.deleteDocument(Booking);