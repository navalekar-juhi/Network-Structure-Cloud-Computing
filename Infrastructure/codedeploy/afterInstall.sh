#!/bin/bash

# update the permission and ownership of WAR file in the tomcat webapps directory
echo "#CSYE6225: doing after install"
pwd
cd /home/centos/
sudo mkdir ccwebapps
#move tar.gz to ccwebapps
sudo mv webapp.tar.gz ccwebapps/
#remove from ccwebapps
sudo rm -rf webapp
#unzip in ccwebapps
cd ccwebapps
sudo tar xzvf webapp.tar.gz
sudo rm -rf webapp.tar.gz
#make a var directory in webapp
# cd webapp/
sudo mkdir webapp/var
#copy .env variables
cd ..
pwd
sudo cp /var/.env /home/centos/ccwebapps/webapp/var
cd ccwebapps/webapp/var/
sudo chmod 666 .env
pwd
cd ..
cd ~
cd ccwebapps/webapp/var
sudo touch webapp.log
cd ~
pwd
aws configure set default.region us-east-1
aws configure list

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/centos/ccwebapps/infrastructure/aws/cloudformation/amazon-cloudwatch-config.json -s

cd ccwebapps/webapp/
pwd
sudo npm install
sudo npm install pm2 -g

