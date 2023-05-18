const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

const app = require('./app');
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//Listen for Uncaught Exceptions
process.on('uncaughtException', err => {
    console.log("Uncaught Exception! Shutting down.");
    console.log(err.name, err.message);
    process.exit(1);
});

//console.log(db);
//console.log(process.env.DATABASE_LOCAL);

mongoose
    //.connect(db) //Atlas DB
    .connect(process.env.DATABASE_LOCAL) //Local DB
    .then(() => {
        console.log("DB Connection successful");
    })
    .catch(err => console.log("Error: ", err));

//console.log(app.get('env')); //development
//console.log(process.env); //Node Environment variables

//START SERVER
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log("App running on port", port);
});

//Listen for Unhandled Rejections
process.on('unhandledRejection', err => {
    console.log("Unhandled Rejection! Shutting down.");
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1); //1 = Uncaught exception
    });
});