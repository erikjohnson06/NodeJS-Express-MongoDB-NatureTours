const AppError = require('../utils/appError');

const sendErrorDev = (error, request, response) => {

    console.error('Error', error);

    //API Error Handler
    if (request.originalUrl.startsWith('/api')){
        return response.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            stack: error.stack,
            error: error
        });
    }

    //Rendered Site Error Handle
    return response.status(error.statusCode).render('error', {
        title: 'Oops.. An Error Has Occurred',
        message: error.message
    });
};

const sendErrorProd = (error, request, response) => {

    //Log error to console
    console.error('Error', error);

    //API Error Handler
    if (request.originalUrl.startsWith('/api')){

        //Operational errors: those that we generate with AppError
        if (error.isOperational) {
            return response.status(error.statusCode).json({
                status: error.status,
                message: error.message
            });
        }

        //Other errors: send generic error message
        return response.status(500).json({
            status: 'Error',
            message: 'Whoops... something went wrong.'
        });
    }

    //Operational errors: those that we generate with AppError
    if (error.isOperational) {
        return response.status(error.statusCode).render('error', {
            title: 'Oops! Something went wrong..',
            message: error.message
        });
    }

    //Rendered Site Error Handle
    return response.status(error.statusCode).render('error', {
        title: 'Oops.. An Error Has Occurred',
        message: 'Whoops... something went wrong.'
    });
};

//Convert standard Error to operational AppError for specific events
const handleMongooseCastError = error => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
};

const handleMongooseDuplicateFieldError = error => {

    let message = "Duplicate field value";

    //Attempt to extract the entered value from the error in keyValue object.
    if (typeof error.keyValue !== "undefined" && typeof Object.values(error.keyValue)[0] !== "undefined"){
        message += ": '" + Object.values(error.keyValue)[0] + "'";
    }

    message += ". Please use another value.";

    return new AppError(message, 400);
};

const handleMongooseValidationError = error => {

    let errors = Object.values(error.errors).map( el => el.message );
    let message = `Invalid input data. ${errors.join('. ')}` ;

    return new AppError(message, 400);
};

const handleJWTError = () => {
    return new AppError("Invalid Token. Please login again.", 401);
};

const handleJWTExpiredError = () => {
    return new AppError("Token has expired. Please login again.", 401);
};

module.exports = (error, request, response, next) => {

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, request, response);
    } else if (process.env.NODE_ENV === 'production') {

        let err = { ...error };
        err.message = error.message;

        if (error.name === 'CastError'){
            err = handleMongooseCastError(err);
        }
        if (error.code === 11000){ //11000 = Duplicate field error in Mongoose
            err = handleMongooseDuplicateFieldError(err);
        }
        if (error.name === 'ValidationError'){
            err = handleMongooseValidationError(err);
        }
        if (error.name === 'JsonWebTokenError'){
            err = handleJWTError(err);
        }
        if (error.name === 'TokenExpiredError'){
            err = handleJWTExpiredError(err);
        }

        sendErrorProd(err, request, response);
    }
};


