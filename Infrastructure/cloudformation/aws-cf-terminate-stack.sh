STACK_NAME=$1

aws cloudformation list-stack-resources --stack-name $STACK_NAME
if [ $? -ne "0" ]
	then 
	echo "Nothing to terminate as Stack does not exit"
	exit 1
	fi

aws cloudformation delete-stack --stack-name $STACK_NAME

aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME

if [ $? -ne "0" ]
then 
	echo "Termination of AWS CloudFormation Stack failed"
else
	echo "Termination of AWS CloudFormation Stack Success"
fi