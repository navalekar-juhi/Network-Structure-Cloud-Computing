const express = require('express');
const router = express.Router();
const mysql = require('../services/mysql');
const bcrypt = require('bcryptjs');
const emailValidator = require('email-validator');


router.use('/', (req, res, next) => {

    var contentType = req.headers['content-type'];
    if (contentType == 'application/json' || contentType.includes('multipart/form-data')) {
        var auth = req.headers['authorization'];

        if (!auth) {
            return res.status(401).json({ msg: 'Unauthorized Access' });
        }
        else {
            var temp = auth.split(" ");
            var decodedAuth = Buffer.from(temp[1], 'base64').toString();
            var credentials = decodedAuth.split(":");
            var username = credentials[0];
            var password = credentials[1];

            if (emailValidator.validate(username) == true) {
                mysql.query('select * from users where username = (?)', [username], (err, data) => {
                    if (data[0] == null) {

                        res.status(404).json({ msg: 'user does not exists' });
                    }
                    else {
                        bcrypt.compare(password, data[0].password, (err, result) => {
                            if (result) {
                                next();
                            }
                            else {
                                res.status(403).json({ msg: 'Enter correct password' });
                            }
                        });
                    }
                    if (err) {
                        console.log("error while fetching data" + err);
                    }
                });
            }
            else {
                res.status(400).send({ msg: `${username} is not a valid email address` });
            }
        }
    }
    else {
        res.status(400).json({ msg: 'Request Type must be json' });
    }

});

module.exports = router;