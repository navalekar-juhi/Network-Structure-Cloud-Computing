const connection = require('./../services/mysql');
function schema(){
    connection.query('create table if not exists users(username varchar(100) PRIMARY KEY,password varchar(100));', (err, result) => {
        if (err) {
            console.log(err);
        }
    });
    connection.query('create table if not exists image(id varchar(100) PRIMARY KEY,url varchar(255));', (err) => {
        if (err) {
            console.log(err);
        }
    });
    connection.query('create table if not exists book(id varchar(100) PRIMARY KEY,title varchar(100),author varchar(100), \
    isbn varchar(100),quantity int,imageId varchar(100), FOREIGN KEY(imageId) REFERENCES image(id));', (err) => {
            if (err) {
                console.log(err);
            }
        });
}
module.exports = {
    schema,
    connection
} 