const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('./../models/tourModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


exports.getCheckoutSession = catchAsyncErrors(async (request, response, next) => {

    //Get tour by Id
    const tour = await Tour.findById(request.params.tourId);

    console.log("slug: ", tour.slug);

    //Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url:`${request.protocol}://${request.get('host')}/`,
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
