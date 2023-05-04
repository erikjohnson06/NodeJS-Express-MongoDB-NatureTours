//const fs = require('fs');
const Tour = require('./../models/tourModel');
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//Middleware to ensure a tour id is valid
exports.checkId = (request, response, next, val) => {

    const id = parseInt(request.params.id);
//    const tour = tours.find(el => el.id === id);

//    if (!tour) {
//        return response
//                .status(404)
//                .json({
//                    status: "error",
//                    message: "Invalid ID"
//                });
//    }

    next();
};

//Middleware to check for required fields for a new tour record
//exports.checkBody = (request, response, next) => {
//
//    console.log("checkBody:" , request.body, typeof (request.body.name), typeof (request.body.price));
//    if (typeof (request.body.name) === "undefined" || typeof (request.body.price) === "undefined") {
//    //if (!request.body.name || !request.body.price) {
//        return response
//                .status(400)
//                .json({
//                    status: "error",
//                    message: "Invalid Tour Name or Price"
//                });
//    }
//
//    next();
//};

exports.getAllTours = async (request, response) => {

    try {

        const tours = await Tour.find();

        response
                .status(200)
                .json({
                    status: "success",
                    results: tours.length,
                    data: {
                        tours: tours
                    }
                });
    } catch (e) {
        response.status(400).json({
            status: "fail",
            message: "An unexpected error has occurred",
            error: e
        });
    }
};

exports.getTourById = async (request, response) => {

    try {

        const tour = await Tour.findById(request.params.id);
        //const tour = await Tour.findOne({_id: request.params.id })

        response
                .status(200)
                .json({
                    status: "success",
                    data: {
                        tour: tour
                    }
                });
    } catch (e) {
        response.status(400).json({
            status: "error",
            message: "An unexpected error has occurred",
            error: e
        });
    }
};

exports.createTour = async (request, response) => {

    try {

        //console.log(request.body);

        //const tour = new Tour({});
        const tour = await Tour.create(request.body); //Returns Promise

        response.status(201).json({
            status: "success",
            message: "Tour Created Successfully",
            data: {
                tour: tour
            }
        });
    } catch (e) {
        response.status(400).json({
            status: "error",
            message: "Data validation failed!",
            error: e
        });
    }
};

exports.updateTourById = async (request, response) => {

    try {

        const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
            new: true, //return newly updated document
            runValidators : true
        });

        response.status(201).json({
            status: "success",
            message: "Tour Updated Successfully",
            data: {
                tour: tour
            }
        });
    } catch (e) {
        response.status(400).json({
            status: "error",
            message: "An unexpected error has occurred",
            error: e
        });
    }
};

exports.deleteTourById = async (request, response) => {

    try {

        await Tour.findByIdAndDelete(request.params.id, request.body);

        response.status(204).json({
            status: "success",
            message: "Tour Deleted Successfully",
            data: {}
        });
    } catch (e) {
        response.status(400).json({
            status: "error",
            message: "An unexpected error has occurred",
            error: e
        });
    }
};