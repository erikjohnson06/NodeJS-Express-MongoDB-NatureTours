const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({path: './config.env'});

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

console.log(db);
console.log(process.env.DATABASE_LOCAL);

mongoose
    //.connect(db) //Atlas DB
    .connect(process.env.DATABASE_LOCAL) //Local DB
    .then(() => {console.log("DB Connection successful");});

//console.log(app.get('env')); //development
//console.log(process.env); //Node Environment variables

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

//IMPORT DATA
const importData = async ()=> {
    try {
        await Tour.create(tours);
        console.log("Data successfully loaded");
    }
    catch(e){
        console.log(e);
    }

    process.exit();
};

//DELETE ALL DATA
const deleteData = async ()=> {
    try {
        await Tour.deleteMany();
        console.log("Data successfully deleted");
    }
    catch(e){
        console.log(e);
    }

    process.exit();
};

if (process.argv[2] === '--import'){
    console.log("importing data...");
    importData();
}
else if (process.argv[2] === '--delete'){
    console.log("deleting data...");
    deleteData();
}

console.log(process.argv[2]);

//Usage:
//node dev-data\data\import-dev-data.js --import
//node dev-data\data\import-dev-data.js --delete