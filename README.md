# Node.js Application Deployment on AWS EKS using Jenkins CI/CD

## Project Overview

This project demonstrates the deployment of a Node.js application on Amazon EKS using a CI/CD pipeline.

The application source code is stored in GitHub. Jenkins automatically builds the application, creates a Docker image, pushes the image to Docker Hub, and deploys the application to an existing Amazon EKS cluster.

## Architecture

GitHub
   |
   | Source Code
   v
Jenkins
   |
   | npm install
   v
Node.js Application
   |
   | Docker Build
   v
Docker Image
   |
   | Docker Push
   v
Docker Hub
   |
   | kubectl deploy
   v
Amazon EKS
   |
   v
Kubernetes Pod
   |
   v
Kubernetes Service
   |
   v
AWS Load Balancer
   |
   v
End User


## Technologies Used

- GitHub
- Jenkins
- Node.js
- npm
- Docker
- Docker Hub
- Kubernetes
- Amazon EKS
- AWS EC2
- AWS CLI
- kubectl
- eksctl


## Application Details

Application Name:

Node.js Docker Web Application

Application Port:

3000

Health Check:

/healthz

Readiness Check:

/ready


## Project Structure

```text
node-app/
│
├── Dockerfile
├── Jenkinsfile
├── README.md
├── package.json
├── server.js
└── nodejsapp.yaml
