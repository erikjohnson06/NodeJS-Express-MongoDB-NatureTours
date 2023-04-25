const express = require('express');

const app = express();

app.get('/', (request, response) => {
    response
            .status(200)
            .json({message: "Hello from server", app: "Nature Tours"});
});

app.post('/', (request, response) => {
    response
            .status(200)
            .send("Post Request");
});

const port = 3000;

app.listen(port, () => {
    console.log("App running on port", port);
});

