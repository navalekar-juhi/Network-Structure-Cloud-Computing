var mysql = require('mysql');
const aws = require('aws-sdk');
const path = require('path');
var connection = null;
require('dotenv').config({path: path.resolve(__dirname, '../var/.env')});

if (process.env.NODE_ENV === 'development') {
    //mysql local database connection
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: "root",
        password: "Sumit1234",
        database: "Library"
    });
}
else if (process.env.NODE_ENV === 'production') {
    //mysql rds database connection
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: "csye6225master",
        password: "csye6225password",
        database: "csye6225"
    });
}


module.exports = connection;








