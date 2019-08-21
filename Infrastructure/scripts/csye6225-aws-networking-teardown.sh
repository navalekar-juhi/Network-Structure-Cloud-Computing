#!/bin/bash
STACK_NAME=$1
VPC_NAME=${STACK_NAME}-csye6225-vpc
SUBNET1_NAME=${STACK_NAME}-csye6225-subnet1
SUBNET2_NAME=${STACK_NAME}-csye6225-subnet2
SUBNET3_NAME=${STACK_NAME}-csye6225-subnet3
IG_NAME=${STACK_NAME}-csye6225-InternetGateway
ROUTE_TABLE_NAME=${STACK_NAME}-csye6225-public-route-table

VPC_ID=$(aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId, Tags[0].Value]' --output text | grep $VPC_NAME | awk '{print $1}')
echo $VPC_ID
SUBNET1_ID=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=$SUBNET1_NAME --query 'Subnets[*].{ID:SubnetId}' --output text)
SUBNET2_ID=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=$SUBNET2_NAME --query 'Subnets[*].{ID:SubnetId}' --output text)
SUBNET3_ID=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=$SUBNET3_NAME --query 'Subnets[*].{ID:SubnetId}' --output text)

IG_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query 'InternetGateways[*].[InternetGatewayId]' --output text)
#IG_ID=$(aws ec2 describe-internet-gateways --query 'InternetGateways[*].[InternetGatewayId, Tags[0].Value]' --output text | grep $IG_NAME )
ROUTE_TABLE_ID=$(aws ec2 describe-route-tables --query 'RouteTables[*].[RouteTableId, Tags[0].Value]' --output text | grep $ROUTE_TABLE_NAME | awk '{print $1}')

echo "${IG_ID}"
#removal of internet gateway
echo "Removing Internet Gateway ${IG_NAME} from VPC ${VPC_NAME}"
aws ec2 detach-internet-gateway --internet-gateway-id $IG_ID --vpc-id $VPC_ID
if [ $? -eq "0" ]
then 
	echo "Internet Gateway removed from VPC successfully!"
else
	echo "Removal of Internet Gateway from VPC failed"
	exit 1
fi

#deletion of internet gateway
echo "Deleting Internet Gateway"
aws ec2 delete-internet-gateway --internet-gateway-id $IG_ID
if [ $? -eq "0" ]
then 
	echo "Internet Gateway deleted successfully!"
else
	echo "Deletion of Internet Gateway failed"
	exit 1
fi

#deletion of public route
echo "Deleting Public Route"
aws ec2 delete-route --route-table-id ${ROUTE_TABLE_ID} --destination-cidr-block 0.0.0.0/0
if [ $? -eq "0" ]
then 
	echo "Public Route deleted successfully!"
else
	echo "Deletion of Public Route failed"
	exit 1
fi

#deletion of subnet
echo "Deleting Subnet1 ${SUBNET1_NAME}"
aws ec2 delete-subnet --subnet-id ${SUBNET1_ID}
if [ $? -eq "0" ]
then 
	echo "Subnet1 ${SUBNET1_NAME} deleted successfully!"
else
	echo "Deletion of Subnet1 ${SUBNET1_NAME} failed"
	exit 1
fi

echo "Deleting Subnet2 ${SUBNET2_NAME}"
aws ec2 delete-subnet --subnet-id ${SUBNET2_ID}
if [ $? -eq "0" ]
then 
	echo "Subnet2 ${SUBNET2_NAME} deleted successfully!"
else
	echo "Deletion of Subnet2 ${SUBNET2_NAME} failed"
	exit 1
fi

echo "Deleting Subnet3 ${SUBNET3_NAME}"
aws ec2 delete-subnet --subnet-id ${SUBNET3_ID}
if [ $? -eq "0" ]
then 
	echo "Subnet3 ${SUBNET3_NAME} deleted successfully!"
else
	echo "Deletion of Subnet3 ${SUBNET3_NAME} failed"
	exit 1
fi

#delete public route table
echo "Deleting Public Route Table ${ROUTE_TABLE_NAME}"
aws ec2 delete-route-table --route-table-id ${ROUTE_TABLE_ID}
if [ $? -eq "0" ]
then 
	echo "Public Route table deleted successfully!"
else
	echo "Deletion of Public Route table failed"
	exit 1
fi

#delete vpc
echo "Deleting VPC ${VPC_NAME}"
aws ec2 delete-vpc --vpc-id ${VPC_ID}
if [ $? -eq "0" ]
then 
	echo "VPC ${VPC_NAME} deleted successfully!"
else
	echo "Deletion of VPC ${VPC_NAME} failed"
	exit 1
fi

if [ $? -ne "0" ]
then 
	echo "Termination of AWS CLI Stack failed"
else
	echo "Termination of AWS CLI Stack Success"
fi