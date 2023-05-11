//const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/APIFeatures');
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

//Middleware to account for 'top-5-bargain-tours' route alias
exports.aliasTopBargainTours = (request, response, next) => {
    request.query.limit = '5';
    request.query.sort = '-ratingsAverage,price'; //Find highest-rated tours with lowest prices
    request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (request, response) => {

    try {

        console.log("request.query:", request.query);

        const features = (new APIFeatures(Tour.find(), request.query))
                .filter()
                .sort()
                .selectFields()
                .pagination();

        const tours = await features.query;

        //const tours = await Tour.find();

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
            new : true, //return newly updated document
            runValidators: true
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

exports.getTourStats = async (request, response) => {

    try {

        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5}}
            },
            //Group matched result set
            {
                $group: {
                    //_id : '$difficulty', //Field to group by
                    //_id : '$ratingsAverage',
                    _id: {$toUpper: '$difficulty'},
                    toursCount: {$sum: 1}, //Adds 1 for each document
                    ratingsCount: {$sum: '$ratingsQuantity'},
                    averageRating: {$avg: '$ratingsAverage'},
                    averagePrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}
                }
            },
            {
                $sort: {averagePrice: 1} //1 = ASC
            },
            //Match result set again
            //{
            //    $match: {_id: {$ne: 'EASY'}}
            //}
        ]);

        response.status(200).json({
            status: "success",
            message: "",
            data: {
                stats: stats
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

exports.getMonthlyPlan = async (request, response) => {

    try {

        const year = parseInt(request.params.year);


        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }}
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    toursCount: {$sum: 1}, //Count # of tours per month
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {
                    month: '$_id' //Alias "montn" for _id field
                }
            },
            {
                $project: {
                    _id: 0 //remove _id field from results
                }
            },
            {
                $sort: {toursCount: -1} //-1 = DESC
            },
            {
                $limit: 12 //limit to 12 results
            }
        ]);

        response.status(200).json({
            status: "success",
            message: "",
            data: {
                plan: plan
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