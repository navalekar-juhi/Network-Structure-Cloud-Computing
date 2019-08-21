const express = require('express');
const router = express.Router();
const mysql = require('../../services/mysql');
const bcrypt = require('bcryptjs');
const validator = require('../../services/validator');
const moment = require('moment');
const login = require('../../services/authentication');
const emailValidator = require('email-validator');
const sdc = require('./../../services/statsd-client');
const logger = require('./../../services/winston-config');


//Get a user
router.get('/', login, (req, res, next) => {
    sdc.increment("get a user API called");
    let time = moment().format();
    logger.info(`user with username ${username} retrieved`);
    res.status(200).json({ Time: time });
});


//create a user
router.post('/user/register', (req, res) => {
    sdc.increment("create a user API called");
    var contentType = req.headers['content-type'];

    if (contentType == 'application/json') {
        var username = req.body.username;
        var password = req.body.password;

        var hashedPassword = bcrypt.hashSync(password, 10);

        if (username != null && password != null && validator.validate(password) == true && emailValidator.validate(username) == true) {
            mysql.query('Insert into users(username, password) values(?,?);', [username, hashedPassword], (err, result) => {
                if (err) {
                    logger.error(`user with username ${username} already exists`);
                    res.status(409).json({ msg: `User ${username} already exits` });
                }
                else {
                    logger.info(`user with username ${username} inserted`);
                    res.status(200).json(`Inserted ${username}`);
                }
            });
        }
        else if (username == null || password == null) {
            logger.error(`Please enter username and password`);
            res.status(400).json({ msg: 'Please enter username and password' });
        }
        else if (emailValidator.validate(username) == false) {
            logger.error(`${username} is not a valid email`);
            res.status(400).json({ msg: `${username} is not a valid email` });
        }

        else {
            logger.error(`password must be atleast 9 letters \
            and should contain an uppercase, lowercase, digits and symbols. Also should \
            not contain spaces`);

            res.status(400).json({
                msg: 'password must be atleast 9 letters \
        and should contain an uppercase, lowercase, digits and symbols. Also should \
        not contain spaces'});
        }
    }
    else {
        logger.error(`Request type must be json`);
        res.status(400).json({ msg: 'Request type must be json' });

    }

});

module.exports = router;