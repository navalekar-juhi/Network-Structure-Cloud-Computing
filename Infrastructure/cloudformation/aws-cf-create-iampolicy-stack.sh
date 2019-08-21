STACK_NAME=$1
BUCKETNAME=$2
AWSREGION="us-east-1"
AWSACCOUNTID=""

aws cloudformation create-stack --stack-name $STACK_NAME --template-body file://aws-cf-iampolicies.json --parameters ParameterKey=BucketName,ParameterValue=$2 ParameterKey=AWSRegion,ParameterValue=$AWSREGION ParameterKey=AWSAccountID,ParameterValue=$AWSACCOUNTID  --capabilities CAPABILITY_NAMED_IAM