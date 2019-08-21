const express = require('express');
const router = express.Router();
const getUsername = require('./../../services/getUsername');
const aws = require('./../../services/awsConfig').aws;
const sdc = require('./../../services/statsd-client')
const logger = require('./../../services/winston-config')


router.get('/',getUsername, (req, res, next)=>{
    sdc.increment("password reset api called");
    var username = req.username;
    var password = req.password;

    aws.config.update({region:'us-east-1'});
    var abc = {};
    var arn;
    var msg;
    var sns = new aws.SNS();

    sns.listTopics(abc, (err, data)=>{
        if(err){
            logger.error('error in sns list topics')
            console.log('err in sns listTopics')
        }
        else{
            arn = data.Topics[0].TopicArn;
            msg = username

            var params = {
            Message : msg,
            TopicArn: arn
            };
            sns.publish(params, (err, data)=>{
                if(err){
                    logger.error('error in sns publish')
                    console.log("err in sns publish");
                    res.status(400).json('error in sns publish');
                }
                else{
                    logger.info('sns publish success')
                    console.log("sns publish success"+ data);
                    res.status(201).json({msg:'published'});
                    //res.json({msg: data});
                }
            })
        }
    })
    //console.log(username);
    //console.log(password);
})

module.exports = router;