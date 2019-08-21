Network STructures and Cloud Computing


Technology Stack:
1.NodeJs and ExpressJs
2.MySQL
3.Postman
4.CircleCi
5.GitHub

Build Instructions

Pre-requistes:
1.NodeJs
2.Any IDE
3.MySQL Server
4.npm
5.Express Framework
6.AWS S3 Bucket

Steps:

1.Clone or download the repository
2.Use the ide to open the project
3.Build the cloud infrastructure using the scripts of cloud formation(infrastructure/cloudformation)
4.Deploy the project using GitHub and CircleCi for continous integration and deployment.
5.Run the application using postman


Open Postman or any other REST client and give the URL for the following:

Get request: localhost:3000/
Get request: localhost:3000/book
Get request: localhost:3000/book/{id}
Post request: localhost:3000/book
Put request: localhost:3000/book
Delete request: localhost:3000/book/{id}
Post request: localhost:3000/book/{idBook}/image
Get request: localhost:3000/book/{idBook}/image/{idImage}
Put request : localhost:3000/book/{idBook}/image/{idImage}
Delete request : localhost:3000/book/{idBook}/image/{idImage}
Post request: localhost:3000/reset

