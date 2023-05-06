const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

const app = require('./app');
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

console.log(db);
console.log(process.env.DATABASE_LOCAL);

mongoose
        //.connect(db) //Atlas DB
        .connect(process.env.DATABASE_LOCAL) //Local DB
        .then(() => {
            console.log("DB Connection successful");
        }
        );


//console.log(app.get('env')); //development
//console.log(process.env); //Node Environment variables

//START SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("App running on port", port);
});