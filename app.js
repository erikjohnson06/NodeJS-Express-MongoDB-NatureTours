const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;

//Define Middleware
app.use(express.json());

app.use((request, response, next) => {
    console.log("Middleware...");
    next();
});

app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    next();
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getAllTours = (request, response) => {

    console.log("requestTime: ", request.requestTime);

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

const getTourById = (request, response) => {

    //console.log(request.params);

    const id = parseInt(request.params.id);
    const tour = tours.find(el => el.id === id);

    if (!tour) {
        return response
                .status(404)
                .json({
                    status: "fail",
                    message: "Invalid ID"
                });
    }

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

const createTour = (request, response) => {

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

const updateTourById = (request, response) => {

    const id = parseInt(request.params.id);
    const tour = tours.find(el => el.id === id);

    if (!tour) {
        return response
                .status(404)
                .json({
                    status: "fail",
                    message: "Invalid ID"
                });
    }

    response.status(200).json({
            status: 'success',
            data: {
                tour: "<updated tour here>"
            }
        });
};

const deleteTourById = (request, response) => {

    const id = parseInt(request.params.id);
    const tour = tours.find(el => el.id === id);

    if (!tour) {
        return response
                .status(404)
                .json({
                    status: "fail",
                    message: "Invalid ID"
                });
    }

    response.status(204).json({
            status: 'success',
            data: null
        });
};

//app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTourById);
//app.post('/api/v1/tours', createTour);
//app.patch('/api/v1/tours/:id', updateTourById);
//app.delete('/api/v1/tours/:id', deleteTourById);

app.route('/api/v1/tours')
        .get(getAllTours)
        .post(createTour);

app.route('/api/v1/tours/:id')
        .get(getTourById)
        .patch(updateTourById)
        .delete(deleteTourById);

app.listen(port, () => {
    console.log("App running on port", port);
});

