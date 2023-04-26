const fs = require('fs');
const express = require('express');

const app = express();
const port = 3000;

app.use(express.json()); //Middleware

//app.get('/', (request, response) => {
//    response
//            .status(200)
//            .json({message: "Hello from server", app: "Nature Tours"});
//});
//
//app.post('/', (request, response) => {
//    response
//            .status(200)
//            .send("Post Request");
//});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

//Get all tours
app.get('/api/v1/tours', (request, response) => {
    response
            .status(200)
            .json({
                status: "success",
                results: tours.length,
                data: {
                    tours: tours
                }
            });
});

//Create new tour
app.post('/api/v1/tours', (request, response) => {

    console.log(request.body);

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id : newId}, request.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        response.status(201).json({
            status: 'success',
            data : {
                tour: newTour
            }
        });
    });

    //console.log(request.body);
//    response
//            .status(200)
//            .send("Done");
});



app.listen(port, () => {
    console.log("App running on port", port);
});

