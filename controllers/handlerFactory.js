const APIFeatures = require('../utils/APIFeatures');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');

/**
 *
 * @param {Object} Model
 */
exports.updateDocument = Model =>
    catchAsyncErrors(async (request, response, next) => {

        const data = await Model.findByIdAndUpdate(request.params.id, request.body, {
            new : true, //return newly updated document
            runValidators: true
        });

        if (!data) {
            return next(new AppError(`No document found with id: ${request.params.id}`, 404));
        }

        response.status(200).json({
            status: "success",
            message: "Document Updated Successfully",
            data: data
        });
    });

/**
 * @param {Object} Model
 */
exports.deleteDocument = Model =>
    catchAsyncErrors(async (request, response, next) => {

        const data = await Model.findByIdAndDelete(request.params.id, request.body);

        if (!data) {
            return next(new AppError(`No document found with id: ${request.params.id}`, 404));
        }

        response.status(204).json({
            status: "success",
            message: "Document Deleted Successfully: " + request.params.id,
            data: {}
        });
    });

/**
 * @param {Object} Model
 */
exports.createDocument = Model =>
    catchAsyncErrors(async (request, response, next) => {

        const data = await Model.create(request.body); //Returns Promise

        response.status(201).json({
            status: "success",
            message: "Document Created Successfully",
            data: data
        });
    });

/**
 * @param {Object} Model
 * @param {Object} populateOptions
 */
exports.getDocument = (Model, populateOptions) =>
    catchAsyncErrors(async (request, response, next) => {

        let query = Model.findById(request.params.id);

        if (populateOptions) {
            query = query.populate(populateOptions);
        }

        const data = await query;
        //const data = await Model.findOne({_id: request.params.id }); //Alternative method

        if (!data) {
            return next(new AppError(`No document found with id: ${request.params.id}`, 404));
        }

        response
                .status(200)
                .json({
                    status: "success",
                    data: data
                });
    });

/**
 * @param {Object} Model
 */
exports.getAllDocuments = Model =>
    catchAsyncErrors(async (request, response, next) => {

        let filterObj = {};

        //Allow for nested GET reviews
        if (request.params.tourId) {
            filterObj = {tour: request.params.tourId};
        }

        const features = (new APIFeatures(Model.find(filterObj), request.query))
                .filter()
                .sort()
                .selectFields()
                .pagination();

        const data = await features.query;

        response
                .status(200)
                .json({
                    status: "success",
                    results: data.length,
                    data: data
                });
    });