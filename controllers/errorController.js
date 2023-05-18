const AppError = require('./../utils/appError');

const sendErrorDev = (error, response) => {
    response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: error.stack,
        error: error
    });
};

const sendErrorProd = (error, response) => {

    //Operational errors: those that we generate with AppError
    if (error.isOperational) {
        response.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    }
    //Other errors: send generic error message
    else {

        //Log error to console
        console.error('Error', error);

        response.status(500).json({
            status: 'Error',
            message: 'Whoops... something went wrong.'
        });
    }
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

module.exports = (error, request, response, next) => {

    //console.log(error.stack);

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, response);
    } else if (process.env.NODE_ENV === 'production') {

        let err = { ...error };

        console.log("Error name: ", error.name);
        //console.log("Err name: ", err.name);

        if (error.name === 'CastError'){
            err = handleMongooseCastError(err);
        }
        if (error.code === 11000){ //11000 = Duplicate field error in Mongoose
            err = handleMongooseDuplicateFieldError(err);
        }
        if (error.name === 'ValidationError'){
            err = handleMongooseValidationError(err);
        }

        sendErrorProd(err, response);
    }
};


