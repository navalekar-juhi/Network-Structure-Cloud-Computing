Instructions for Infrastructure as Code with Cloud Formation :

Clone or download the repository
Open command line in this directory ccwebapps/infrastructure/aws/cloudformation

a. To run csye6225-aws-cf-create-stack.sh Run the file by giving command on command line ‘bash csye6225-aws-cf-createstack.sh (provide stack name) (provide region one for subnet 1) (provide region 2 for subnet2) (provide region 3 for subnet 3)’

b. To run csye6225-aws-cf-terminate-stack.sh Run the file by giving command on command line ‘bash csye6225-aws-cf-terminate-stack.sh (provide stack name)


c.To run the script to create application stack
bash csye6225-aws-cf-create-application-stack.sh stack_name key_pair

d.To run the script to terminate application stack
bash csye6225-aws-cf-terminate-application-stack.sh stack_name