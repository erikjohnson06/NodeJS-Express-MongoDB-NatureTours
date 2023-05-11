const fs = require('fs');
const express = require('express');
const morgan = require('morgan'); //HTTP Request logging package

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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
    next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//ROUTE ERROR HANDLER
app.all('*', (request, response, next) => {
    response.status(404).json({
        status: 'fail',
        message: `Unknown route: ${request.originalUrl}.`
    });
});

module.exports = app;