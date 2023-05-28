const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');

exports.deleteOne = Model => catchAsyncErrors(async (request, response, next) => {

    const obj = await Model.findByIdAndDelete(request.params.id, request.body);

    if (!obj) {
        return next(new AppError(`No document found with id: ${request.params.id}`, 404));
    }

    response.status(204).json({
        status: "success",
        message: "Document Deleted Successfully: "  + request.params.id,
        data: {}
    });
});

exports.deleteTourById = catchAsyncErrors(async (request, response, next) => {

    const tour = await Tour.findByIdAndDelete(request.params.id, request.body);

    if (!tour) {
        return next(new AppError(`No tour found with id: ${request.params.id}`, 404));
    }

    response.status(204).json({
        status: "success",
        message: "Tour Deleted Successfully",
        data: {}
    });
});

