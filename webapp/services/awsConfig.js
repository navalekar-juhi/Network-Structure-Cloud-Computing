const aws = require('aws-sdk');

// const sns = aws.SNS

function ec2Credentials(){
    var promise = new Promise((resolve, reject)=>{

        var metadata = new aws.MetadataService();

        metadata.request('/latest/meta-data/iam/security-credentials/CodeDeployEC2ServiceRole', (err, data)=>{
            if(err) reject (err);
            else{
                console.log('run the config');
console.log('json data',data);
                resolve(JSON.parse(data));
            }
        })
    })
    return promise;

}
ec2Credentials()
.then((credentials)=>{
    aws.config.accessKeyId  = credentials.AccessKeyId;
    aws.config.secretAccessKey = credentials.SecretAccessKey;
    aws.config.sessionToken = credentials.Token;
console.log('aws config',aws.config);
})
.catch((err)=>{
    console.log(err);
})

module.exports = {
    aws
}
