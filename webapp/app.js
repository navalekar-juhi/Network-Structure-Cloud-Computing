const express = require('express');
const app = express();
const mysql = require('./services/mysql');
const rdsSchema = require('./services/rdsSchema');
const aws = require('./services/awsConfig');
const path = require('path');
const logger = require('./services/winston-config');



app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//user middleware
app.use('/', require('./routes/api/users'));

//book middleware
app.use('/book', require('./routes/api/book'));

//reset middleware
app.use('/reset', require('./routes/api/reset'));

//test middleware
app.use('/test', (req, res, next) => {
    console.log("http all middleware running" + req.method);
    next();
});

app.get('/test', (req, res, next) => {
    console.log("http get middleware running" + req.method);
    next();
});

//error page middleware
app.use((req, res, next) => {
    var err = new Error('Page not found');
    err.status = 404;
    next(err);
})

//handling error middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    logger.error('Page does not exists');
    res.send(err.message);
});

//handling mysql error
mysql.connect((err) => {
    if (err) {
        console.log("Error occured in sql" + err)
    }
    else {
        rdsSchema.schema();
        console.log('mysql connected....');
    }
});



if(process.env.NODE_ENV === "production"){
    aws.aws;
}
module.exports = app.listen(3000, () => {
    console.log('server started on port 3000....')
});

// module.exports = server;

