const fs = require('fs');
const express = require('express');
const morgan = require('morgan'); //HTTP Request logging package

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const app = express();

//Log in development mode
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//MIDDLEWARE
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    //console.log(request.headers);

    next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//ROUTE ERROR HANDLER
app.all('*', (request, response, next) => {

    //const error = new AppError(`Unknown route: ${request.originalUrl}.`, 404);
    //error.status = 'fail';
    //error.statusCode = 404;

    next(new AppError(`Unknown route: ${request.originalUrl}.`, 404));
});

app.use(errorHandler);

module.exports = app;