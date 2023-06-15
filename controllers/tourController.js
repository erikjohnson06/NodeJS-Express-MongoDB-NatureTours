//Image processing Libraries
const multer = require('multer');
const sharp = require('sharp');

//const fs = require('fs');
const Tour = require('./../models/tourModel');
const catchAsyncErrors = require('./../utils/catchAsyncErrors');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, callback) => {
    if (file.mimetype.startsWith('image')) {
        callback(null, true);
    } else {
        callback(new AppError('Please limit file uploads to images only', 400), false);
    }
};

const imageUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = imageUpload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]);

exports.resizeTourImages = catchAsyncErrors(async (request, response, next) => {

    if (!request.files.imageCover || !request.files.images) {
        return next();
    }

    //Cover Image
    request.body.imageCover = `tour-${request.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(request.files.imageCover[0].buffer)
            .resize(2000, 1333) //3-to-2 ratio
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${request.body.imageCover}`);

    //Tour Images
    request.body.images = [];

    await Promise.all(
            request.files.images.map(async (file, index) => {

                const filename = `tour-${request.params.id}-${Date.now()}-${index + 1}.jpeg`;

                await sharp(file.buffer)
                        .resize(2000, 1333) //3-to-2 ratio
                        .toFormat('jpeg')
                        .jpeg({quality: 90})
                        .toFile(`public/img/tours/${filename}`);

                request.body.images.push(filename);
            })
            );

    next();
});

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

exports.getTourStats = catchAsyncErrors(async (request, response, next) => {

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
});

exports.getMonthlyPlan = catchAsyncErrors(async (request, response, next) => {

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
});

/**
 * Ex: tours-within/:distance/center/:latlong/unit/:unit
 *     tours-within/250/center/34.111745,-118.113491/unit/mi
 */
exports.getToursWithinDistance = catchAsyncErrors(async (request, response, next) => {

    const {distance, latlong, unit} = request.params;
    const [lat, long] = latlong.split(',');

    const earthRadius = (unit === "mi" ? 3963.2 : 6378.1); //Miles or Kilometers
    const radius = distance / earthRadius;

    if (!lat || !long) {
        next(new AppError('Unable to resolve lat/long coordinates. Required format: lat,long', 400));
    }

    //console.log(distance, latlong, lat, long, unit);

    const tours = await Tour.find({
        startLocation: {$geoWithin: {$centerSphere: [[long, lat], radius]}}
    });

    response.status(200).json({
        status: "success",
        message: "",
        results: tours.length,
        data: {
            tours: tours
        }
    });
});

/**
 * Calculate the distances to all tours from a given starting lat/long coordinate
 */
exports.getDistanceToTourStartingPoints = catchAsyncErrors(async (request, response, next) => {

    const {latlong, unit} = request.params;
    const [lat, long] = latlong.split(',');

    const multiplier = (unit === "mi" ? 0.000621371 : 0.001); //Miles or Kilometers

    if (!lat || !long) {
        next(new AppError('Unable to resolve lat/long coordinates. Required format: lat,long', 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [long * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }

    ]);

    response.status(200).json({
        status: "success",
        message: "",
        data: {
            distances: distances
        }
    });
});

exports.getAllTours = factory.getAllDocuments(Tour);
exports.getTourById = factory.getDocument(Tour, {path: 'reviews'});
exports.createTour = factory.createDocument(Tour);
exports.updateTourById = factory.updateDocument(Tour);
exports.deleteTourById = factory.deleteDocument(Tour);