const mongoose = require('mongoose');
require('dotenv').config();


//define the mongodb connection url
const mongoURL = process.env.MONGODB_URL_LOCAL
// const mongoURL = process.env.MONGODB_URL;
//setup mongodb conecion
mongoose.connect(mongoURL);
    

//set the defaut conection
//mongoose maintains a default connection object representing the mongodb connection
const db = mongoose.connection;


//defin event listner for database connection
db.on('connected', () => {
    console.log('connected to mongdb server');
});


db.on('error', () => {
    console.log('mongodb connection error');
});

db.on('disconnected', () => {
    console.log('mongodb disconnected');
});


//export the database connection
module.exports = db;