const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//Middleware to ensure a tour id is valid
exports.checkId = (request, response, next, val) => {

    const id = parseInt(request.params.id);
    const tour = tours.find(el => el.id === id);

    if (!tour) {
        return response
                .status(404)
                .json({
                    status: "error",
                    message: "Invalid ID"
                });
    }

    next();
};

//Middleware to check for required fields for a new tour record
exports.checkBody = (request, response, next) => {

    console.log("checkBody:" , request.body, typeof (request.body.name), typeof (request.body.price));
    if (typeof (request.body.name) === "undefined" || typeof (request.body.price) === "undefined") {
    //if (!request.body.name || !request.body.price) {
        return response
                .status(400)
                .json({
                    status: "error",
                    message: "Invalid Tour Name or Price"
                });
    }

    next();
};

exports.getAllTours = (request, response) => {

    //console.log("requestTime: ", request.requestTime);

    response
            .status(200)
            .json({
                status: "success",
                results: tours.length,
                data: {
                    tours: tours
                }
            });
};

exports.getTourById = (request, response) => {

    //console.log(request.params);
    const id = parseInt(request.params.id);
    const tour = tours.find(el => el.id === id);

    response
            .status(200)
            .json({
                status: "success",
                message: "",
                data: {
                    tour: tour
                }
            });
};

exports.createTour = (request, response) => {

    console.log(request.body);

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id: newId}, request.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        response.status(201).json({
            status: "success",
            message: "",
            data: {
                tour: newTour
            }
        });
    });
};

exports.updateTourById = (request, response) => {

    const id = parseInt(request.params.id);
    const tour = tours.find(el => el.id === id);

    response.status(200).json({
        status: 'success',
        data: {
            tour: "<updated tour here>"
        }
    });
};

exports.deleteTourById = (request, response) => {

    const id = parseInt(request.params.id);
    const tour = tours.find(el => el.id === id);

    response.status(204).json({
        status: "success",
        data: null
    });
};