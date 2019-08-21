const express = require('express');
const uuid = require('uuid');
const mysql = require('../../services/mysql');
const login = require('../../services/authentication');
const router = express.Router();
const storage = require('../../services/storage');
var upload = null;
const checkfiletype = storage.checkfiletype;
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const s3 = require('../../services/storage').s3;
const logger = require('./../../services/winston-config');
const sdc = require('./../../services/statsd-client')



if (process.env.NODE_ENV === 'development') {
    upload = storage.upload;
}
else if (process.env.NODE_ENV === 'production') {
    upload = storage.S3Upload;
}


//create a book 
router.post('/', login, (req, res, next) => {
    sdc.increment("create book API called");
    let id = uuid();
    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;
    let imageId = uuid();
    // console.log(imageId);
    //console.log(req.body.image.url);
    let url = null;
    if (typeof (req.body.image) !== 'undefined') {
        if (process.env.NODE_ENV === 'development') {
            url = req.body.image.url;
        }
        else if (process.env.NODE_ENV === 'production') {
            url = "https://s3.amazonaws.com/" + process.env.Bucket + "/" + req.body.image.url;
        }
    }
    else {
        url = 'NULL';
        imageId = 'NULL';
    }
    //console.log(imageId);
    // console.log(url);
    // if(url == 'undefined'){
    //     url = 'NULL';
    // }

    if (id != null && title != null && author != null && isbn != null && quantity != null) {
        if (imageId == 'NULL') {
            //console.log(imageId == 'NULL');
            mysql.query('Insert into book(id, title, author, isbn, quantity) values(?,?,?,?,?);', [id, title, author, isbn, quantity], (err, result) => {
                if (err) {
                    logger.error(`book ${title} not saved`);
                    res.status(409).json({ msg: `book ${title} not saved` });
                }
                else {
                    logger.info(`book with id ${id} saved`);
                    res.status(201).json({ id: `${id}` });
                }
            });
        }
        else {
            mysql.query('Insert into image(id, url) values (?,?)', [imageId, url], (err) => {
                if (err) {
                    console.log('insert book failed' + err);
                }
                else {
                    mysql.query('Insert into book(id, title, author, isbn, quantity, imageId) values(?,?,?,?,?,?);', [id, title, author, isbn, quantity, imageId], (err, result) => {
                        if (err) {
                            logger.error(`book ${title} already exist`);
                            res.status(409).json({ msg: `book ${title} already exist` });
                        }
                        else {
                            logger.info(`book with id ${id} added successfully`);
                            res.status(201).json({ id: `${id}`});
                        }
                    });
                }
            })
        }


    }
    else {
        res.status(400).json({ msg: `Please enter title, author, isbn and quantity` });
    }
});

//get all books
router.get('/', login, (req, res, next) => {
    sdc.increment("get all books api called");
    mysql.query('select b.id, b.title, b.author, b.isbn, b.quantity, i.id as "Id", i.url from book b left outer join image i on b.imageId = i.id', (err, data) => {
        //console.log(data[0].id);
        if (data == '') {
            logger.error('no books found')
            res.status(200).json({ msg: 'no record found' });
        }
        else {
            //console.log(data[0].id)
            console.log('in fetch')
            let result_all = [];
            let s3Url = null;
            data.forEach(element => {
                console.log('in url s3 ' + element.url)
                var imageurl = element.url;
                console.log(imageurl == null);
                if(process.env.NODE_ENV == 'production'){
                    if (imageurl != null) {
                        let url = s3.getSignedUrl('getObject', {
    
                            Bucket: process.env.Bucket,
                            Key: imageurl,
                            //ACL:'private',
                            Expires: 60 * 2
                        });
                        s3Url = url;
                    }
                    else if (imageurl == null) {
                        s3Url = imageurl;
                    }
                }
                else{
                    s3Url = imageurl;
                }

                result_all.push({
                    id: element.id,
                    title: element.title,
                    author: element.author,
                    isbn: element.isbn,
                    quantity: element.quantity,
                    image: {
                        id: element.Id,
                        url: s3Url
                    }
                })
            });
            logger.info('all books retrieved');
            res.status(200).json(result_all);
        }
    });
});




//Get a book by id
router.get('/:id', login, (req, res, next) => {
   sdc.increment("get a book by id API called");
    const id = req.params.id;
    let fileurl = null
    mysql.query('select b.id, b.title, b.author, b.isbn, b.quantity, i.id as "Id", i.url from book b left outer join image i on b.imageId = i.id where b.id = ?', [id], (err, data) => {
        if (data == '') {
            logger.error(`no book found with the id ${id}`)
            res.status(404).json({ msg: `no book found with id ${id}` });
        }
        else {
            if (process.env.NODE_ENV === 'production') {
                if(data[0].url != null){
                    let url = s3.getSignedUrl('getObject', {
                        Bucket: process.env.Bucket,
                        Key: data[0].url,
                        Expires: 60 * 2
                    })
                    fileurl = url;
                }
                else{
                    fileurl = data[0].url;
                }
                }
                
            else if (process.env.NODE_ENV === 'development') {
                fileurl = data[0].url;
            }
            logger.info(` book retrieved with id ${id}`);
            res.status(200).json({
                id: data[0].id,
                title: data[0].title,
                author: data[0].author,
                isbn: data[0].isbn,
                quantity: data[0].quantity,
                image: {
                    id: data[0].Id,
                    url: fileurl
                }
            });
        }
    });

});



//Update a book
router.put('/', login, (req, res, next) => {
    sdc.increment("update a book API called");
    let id = req.body.id;

    let title = req.body.title;
    let author = req.body.author;
    let isbn = req.body.isbn;
    let quantity = req.body.quantity;
    let url;
    let imageId;
    if (typeof (req.body.image) !== 'undefined') {
        url = req.body.image.url;
        imageId = req.body.image.id
    }
    else {
        url = 'NULL';
        imageId = 'NULL'
    }

    if (id != null && title != null && author != null && isbn != null && quantity != null) {

        if (imageId === 'NULL') {
            mysql.query('Update book SET title = ?, author = ?, isbn = ?, quantity = ? where id = ?', [title, author, isbn, quantity, id], (err, result) => {
                // console.log(result.affectedRows);
                if (result.affectedRows == 0) {
                    logger.error(` book with id ${id} not found`);
                    res.status(404).json({ msg: `No record found` });
                }
                else {
                    logger.info(` book updated with id ${id} that has no image`);
                    res.status(204).json({ msg: `Record updated successfully` });
                }
            });
        }
        else if (typeof (imageId) === 'undefined') {
            logger.error(`no imageId provided for book with id ${id} `);
            res.status(400).json({ msg: `Please enter image Id` })
        }
        else if (imageId != 'NULL') {
            console.log(imageId);
            mysql.query('select imageId from book where id = ?', [id], (err, data) => {
                if (data == '') {
                    logger.error(` book with id ${id} not found`);
                    res.status(404).json({ msg: `book not found` });
                }
                else if (data === imageId) {
                    mysql.query('Update image SET url = ? where id = ?', [url, imageId], (err, result) => {

                        if (result.affectedRows == 0) {
                            logger.error(` book with id ${id} has no such image`);
                            res.status(404).json({ msg: `image not found` })
                        }
                        else {
                            mysql.query('Update book SET title = ?, author = ?, isbn = ?, quantity = ?, imageId = ? where id = ?', [title, author, isbn, quantity, imageId, id], (err, result) => {
                                if (result.affectedRows == 0) {
                                    logger.error(` book with id ${id} not found`);
                                    res.status(404).json({ msg: `No record found` });
                                }
                                else {
                                    logger.info(` book with id ${id} updated with Image`);
                                    res.status(204).json({ msg: `Record updated successfully` });
                                }
                            });
                        }
                    })
                }
                else {
                    logger.error(` book with id ${id} contains no such image`);
                    res.status(400).json({ msg: `book contains no such image` });
                }
            })

        }

    }
    else {
        logger.error(`NO title, author, isbn or quantity provided for book with id ${id}`);
        res.status(400).json({ msg: 'Enter title, author, isbn and quantity' });
    }
});


//delete a book
router.delete('/:id', login, (req, res, next) => {
    sdc.increment("delete a book API called");
    let id = req.params.id;
    let imageId = null;
    let imageName = null;

    mysql.query('select b.imageId, i.url from book as b join image as i on b.imageId = i.id where b.id = ?', [id], (err, result) => {

        if (result.length == 0) {
            logger.error(` book with id ${id} not found`);
            res.status(404).json({ msg: `no record found` });
        }
        else if (result[0].imageId == null) {
            mysql.query('Delete from book where id = ?', [id], (err, result) => {
                if (result == 0) {
                    console.log("delete book with no image");
                    logger.error(` book with id ${id} not found`);
                    res.status(404).json({ msg: `No record found` });
                }
                else {
                    logger.info(` book with id ${id} and No image, deleted`);
                    res.status(204).json({ msg: `record ${id} deleted successfully` });
                }
            });
        }
        else {
            imageId = result[0].imageId;
            imageName = result[0].url;
            mysql.query('Delete from book where id = ?', [id], (err, result) => {
                if(err){
                    console.log(err);
                }

                else {
                    mysql.query('Delete from image where id = ?', [imageId], (err, result) => {
                        if(err){
                            console.log(err);
                        }
                        else {
                            if(process.env.NODE_ENV == 'production'){
                                let params = {
                                    Bucket: process.env.Bucket,
                                    Key: imageName
                                }
                                s3.deleteObject(params, (err) => {
                                    if (err) {
                                        console.log('error in delete S3 ' + err)
                                    }
                                })
                            }
                            else if (process.env.NODE_ENV == 'development'){
                                fs.unlink('public/uploads/'+imageId+imageName, (err)=>{
                                    if(err){
                                        console.log('error in local delete'+err);
                                    }else{
                                        console.log('file delete from local');
                                    }
                                })
                            }
                            logger.info(` book with id ${id} and image, deleted`);
                            res.status(204).json({ msg: `record ${imageId} deleted successfully` });
                        }
                    })
                }
            });

            
        }
    })


});



//add a image to the book
router.post('/:id/image', login, (req, res, next) => {
    sdc.increment("add an image to a book API called");
    let imageUUID = uuid();
    req.uuid = imageUUID;
    let imageName = null;
    let id = req.params.id;
    var fileUrls = [];
    // console.log('i am here');
    const sql = 'Insert into image(id, url) values(?,?);';

            //get imageId from book table
            mysql.query('Select imageId from book where id= ?;', id, (err, result) => {
                
                if (result[0].imageId === null || result[0].imageId === 'NULL') {
                    upload(req, res, err => {
                        if (!err) {
                                                        
                            if (process.env.NODE_ENV === 'development') {
                                imageName = req.file.originalname;
                            }
                            else if (process.env.NODE_ENV === 'production') {
                                imageName = req.file.originalname;
                
                                let params = {
                                    Bucket: process.env.Bucket,
                                    Key: req.file.originalname,
                                    Expires: 60 * 2,
                                }
                                s3.getSignedUrl('getObject', params, (err, data) => {
                                    if (err) {
                                        console.log('err in post signedURl ' + err);
                                    }
                                    else {
                                        fileUrls[0] = data;
                                    }
                                })
                            }
                            //let imageName = imageUUID + req.file.filename;
                            console.log(imageName);
                            

                            mysql.query(sql, [imageUUID, imageName], (err) => {

                                if (err) {
                                    logger.error(`image upload error`);
                                    console.log('error in upload' + err);
                                }
                                else {
                                    mysql.query('update book set imageId = ? where id = ?', [imageUUID, id], (err) => {
                                        if (err) {
                                            res.status(400).json({ msg: `error in update` });
                                        }
                                        else {
                                            if(process.env.NODE_ENV == 'development'){
                                                logger.info(`Added image for book with id ${id}`);
                                                res.status(200).json({url:imageName});
                                            }
                                            else if(process.env.NODE_ENV == 'production'){
                                                logger.info(`Added image for book with id ${id}`);
                                                res.status(200).json({url:fileUrls[0]});
                                            }
                                           
                                        }
                                    })
        
                                }
                            });
                        }
                        else if(err) {
                            if (err == 1) {
                                logger.error(`image for book with id ${id} should be jpg or jpeg or png`);
                                res.status(400).json({ msg: 'Image type to be jpg or jpeg or png' });
                            }
                            else
                                res.json('error in upload' + err);
                        }
                    });

                }
                else {
                    logger.error(`image for book with id ${id} already exists`);
                    res.status(400).json({ msg: `Image already exists` })

                }
            })



})

//get a book image
router.get('/:id/image/:imageId', login, (req, res, next) => {
    sdc.increment("get a book image  API called");
    let id = req.params.id;
    let imageId = req.params.imageId;

    mysql.query('select imageId from book where id = ?', [id], (err, result) => {
        if (result == "") {
            logger.error(`book with id ${id} not found`);
            res.status(404).json({ msg: `book not found` });
        }
        else {
            if (result[0].imageId == imageId) {
                mysql.query('select * from image where id =?', [imageId], (err, data) => {
                    if (data == "") {
                        //console.log("sql error " + err);
                        logger.error(`image for book with id ${id} not found`);
                        res.status(404).json({ msg: `no image found` });
                    }
                    else {
                        if (process.env.NODE_ENV === 'production') {
                            if(data[0].url != null){
                                let url = s3.getSignedUrl('getObject', {
                                    Bucket: process.env.Bucket,
                                    Key: data[0].url,
                                    Expires: 60 * 2
                                })
                                logger.info(`image for book with id ${id} retrieved`);
                                res.status(200).json({
                                    id:data[0].id, 
                                    url:url
                                });
                            }
                            else{
                                logger.info(`image for book with id ${id} retrieved`);
                                res.status(200).json({
                                    id:data[0].id, 
                                    url:data[0].url
                                });
                            }

                        }
                        else if (process.env.NODE_ENV === 'development') {
                            logger.info(`image for book with id ${id} retrieved`);
                            res.status(200).json(data);
                        }
                        
                    }
                })
            }
            else {
                logger.info(`book with id ${id} has no such image`);
                res.status(400).json({ msg: `book has no such image` });

            }
        }

    })
})

//update image 
sdc.increment("update image of a book API called");
router.put('/:id/image/:imageId', login, (req, res, next) => {

    upload(req, res, (err) => {
        if (err) {
            logger.error(`error in image upload`);
            console.log('error in upload' + err);
        }
        else {
            let id = req.params.id;
            let imageId = req.params.imageId;
            let url = req.file.originalname;
            //console.log(url);

            mysql.query('select imageId from book where id = ?', [id], (err, result) => {
                if (result == "") {
                    logger.error(` book with id ${id} not found`);
                    res.status(404).json({ msg: `no book found` });
                }
                else {
                    //console.log(result[0].imageId == imageId);
                    if (result[0].imageId == imageId) {
                        mysql.query('update image set url = ? where id = ?', [url, imageId], (err) => {
                            if (err) {
                                logger.error(`image update failed`);
                                console.log("update failed" + err);
                            }
                            else {
                                logger.info(`image for book with id ${id} updated`);
                                res.status(204).json({ msg: `update successful` });
                            }
                        })
                    }
                    else {
                        logger.error(`book with id ${id} has no such image`);
                        res.status(404).json({ msg: `book has no such image` });
                    }
                }
            })
        }

    })

})


//delete an image
router.delete('/:id/image/:imageId', login, (req, res, next) => {
    sdc.increment("delete an image of a book API called");
    let id = req.params.id;
    let imageId = req.params.imageId;
    var imageName = null;

    mysql.query('select b.imageId, i.url from book as b join image as i on b.imageId = i.id where b.id = ?', [id], (err, result) => {
        //console.log(result.length);
        if (result.length == 0) {
            logger.error(`image for book with id ${id} not found`);
            res.status(404).json({ msg: `no image found` });
        }
        else {
            imageName = result[0].url;
            //console.log("This is imageName " + imageName);
            if (result[0].imageId == imageId) {
                mysql.query('update book set imageId = NULL where id = ?', [id], (err) => {
                    if (err) {
                        logger.error(`no image found`);
                        console.log("update failed " + err);
                        res.status(404).json({ msg: `no image found` });
                    }
                    else {
                        mysql.query('delete from image where id = ?', [imageId], (err) => {
                            if (err) {
                                logger.error(`error in delete book image`);
                                console.log('error in delete ' + err);
                            }
                            else if(process.env.NODE_ENV == 'production'){
                                let params = {
                                    Bucket: process.env.Bucket,
                                    Key: imageName
                                }
                                s3.deleteObject(params, (err) => {
                                    if (err) {
                                        logger.error(`error in delete book image from s3`);
                                        console.log('error in delete S3 ' + err)
                                    }
                                })
                            }
                            else if (process.env.NODE_ENV == 'development'){
                                fs.unlink('public/uploads/'+imageId+imageName, (err)=>{
                                    if(err){
                                        logger.error(`error in delete book image from local`);
                                        console.log('error in local delete'+err);
                                    }else{
                                        console.log('file delete from local');
                                    }
                                })
                            }
     
                                //console.log(imageName);
                                logger.info(`image for book with id ${id} deleted`);
                                res.status(204).json({ msg: `delete successfully` })
                        })

                    }
                })
            }
            else {
                logger.error(`image for book with id ${id} not found`);
                res.status(404).json({ msg: `no image found` });
            }
        }
    })
})

// router.get('/home/abc',login,(req, res,next)=>{
//     var name = req.headers;
//     console.log(name);
// })

module.exports = router;