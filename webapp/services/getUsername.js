const express = require('express');
const router = express.Router();

router.use('/',(req, res, next)=>{
    var auth = req.headers['authorization'];
    if(typeof(auth)== 'undefined'){
        res.json({msg:"enter username"});
    }
    else{
    var temp = auth.split(" ");
            var decodedAuth = Buffer.from(temp[1], 'base64').toString();
            var credentials = decodedAuth.split(":");
            var username = credentials[0];
            var password = credentials[1];
        if(username == ""){
            res.json({msg:"enter username"});
        }
        else{

        }
            req.username = username;
            req.password = password;
            next();
    }
})

module.exports = router;



