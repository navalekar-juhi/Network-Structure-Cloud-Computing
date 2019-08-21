
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const aws = require('./awsConfig').aws;
var s3 = null;
var uuid = require('uuid');

const storage = multer.diskStorage({

    destination: './public/uploads',
    filename: (req, file, callback) => {

        const filetypes = /jpg|jpeg|png|/;
        const extname = path.extname(file.originalname);
        console.log(extname);
        if (extname == '.jpg' || extname == '.jpeg' || extname == '.png'){

            callback(null, req.uuid + file.originalname);
        }
        else {
            callback(1);
        }
    }


});

if(process.env.NODE_ENV === 'production'){
    s3 = new aws.S3();
var imageNameUUID = uuid();
var S3Upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.Bucket,
        key: (req, file, callback) => {
            let s3extname = path.extname(file.originalname);
            if (s3extname == '.jpg' || s3extname == '.jpeg' || s3extname == '.png'){
                callback(null,imageNameUUID+file.originalname);
            }
            else{
                callback(1);
            }
            
        }
    })
}).single('image');
}
const upload = multer({
    storage: storage,

}).single('image');

module.exports = {
    upload,
    S3Upload,
    s3
}