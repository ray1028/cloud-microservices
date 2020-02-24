FROM centos:latest
RUN yum update -y
RUN yum install -y nodejs
RUN yum install -y nodejs-nodemon