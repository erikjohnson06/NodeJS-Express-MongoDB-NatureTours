//const fs = require('fs');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan'); //HTTP Request logging package
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();

//Required if hosting on platform like Heroku
//app.enable('trust proxy');

//Set template engine / views folder location
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Define static assets in piblic folder
app.use(express.static(path.join(__dirname, 'public')));

//Log in development mode
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//GLOBAL MIDDLEWARE

//CORS - Cross-Origin Resource Sharing for incoming API requests. Sets "Access-Control-Allow-Origin" header.
app.use(cors());
app.options('*', cors());

//Helmet - Set security HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src" : ["'self'", "blob:", "localhost:3000", "ws:"],
            "connect-src" : ["'self'", "localhost:3000", "ws://localhost:*/",  "https://api.mapbox.com/", "https://events.mapbox.com/"],
            "worker-src" : ["'self'", "blob:"],
            "script-src": ["'self'", "blob:", "localhost:3000", "https://cdnjs.cloudflare.com/", "https://*.tiles.mapbox.com/", "https://api.mapbox.com/", "https://events.mapbox.com/", "https://js.stripe.com/v3/"],
            "style-src": ["'self'", "https://fonts.googleapis.com/", "https://api.mapbox.com/", "https://*.tiles.mapbox.com/", "'unsafe-inline'"],
            "font-src": ["'self'", "https://fonts.googleapis.com/", "https://fonts.gstatic.com/"],
            "frame-src" : ["https://*.stripe.com/"]
        }
    }
}));

//Rate Limiting: allow up to 300 requests from the same IP in one hour
const limiter = rateLimit({
    max: 300,
    windowMs: 60 * 60 * 1000,
    message: 'Whoops.. too many requests have been received from this device. Please wait and try again soon.'
});

app.use('/api', limiter);

//Body parser from body into request.body
app.use(express.json({
    limit: '10kb' //Limit body size to 10 kb
}));

//Parse data from URL encoded form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xssClean());

//Prevent parament "pollution". Whitelist = allowed query fields
app.use(hpp({
    whitelist: [
        'duration',
        'sort',
        'ratingsAverage',
        'ratingsQuantity',
        'difficulty',
        'maxGroupSize',
        'price'
    ]
}));

app.use(compression()); //Compress HTTP Responses

//Test middleware
app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    next();
});

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

//ROUTE ERROR HANDLER
app.all('*', (request, response, next) => {

    //const error = new AppError(`Unknown route: ${request.originalUrl}.`, 404);
    //error.status = 'fail';
    //error.statusCode = 404;

    next(new AppError(`Unknown route: ${request.originalUrl}.`, 404));
});

app.use(errorHandler);

module.exports = app;
