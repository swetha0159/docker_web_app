pipeline {
    agent any

    tools {
        nodejs "node23"
    }

    environment {
        AWS_REGION = "ap-south-1"
        CLUSTER_NAME = "tyson-cluster"
        DOCKERHUB_USER = "swetharoyal"
        DOCKER_IMAGE = "swetharoyal/node-app:latest"
        PATH = "${env.WORKSPACE}/bin:${env.PATH}"
    }

    stages {

        stage('Prepare Tools (kubectl & eksctl)') {
            steps {
                script {
                    echo "Installing kubectl and eksctl locally..."

                    sh '''
                        mkdir -p "${WORKSPACE}/bin"

                        # Install kubectl
                        curl -LO https://dl.k8s.io/release/v1.34.1/bin/linux/amd64/kubectl
                        chmod +x kubectl
                        mv kubectl "${WORKSPACE}/bin/"

                        # Install eksctl
                        curl -sLO https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz
                        tar -xzf eksctl_Linux_amd64.tar.gz
                        mv eksctl "${WORKSPACE}/bin/"

                        # Verify installations
                        kubectl version --client
                        eksctl version
                    '''
                }
            }
        }

        stage('Clone Code from GitHub') {
            steps {
                checkout scm
            }
        }

        stage('Node JS Build') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'docker-creds',
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )
                    ]) {
                        sh '''
                            echo "$DOCKER_PASS" | docker login \
                                -u "$DOCKER_USER" \
                                --password-stdin

                            docker build -t "$DOCKER_IMAGE" .

                            docker push "$DOCKER_IMAGE"

                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Connect to Existing EKS Cluster') {
            steps {
                script {
                    echo "Connecting to existing EKS cluster: ${CLUSTER_NAME}"

                    sh '''
                        aws eks update-kubeconfig \
                            --name "${CLUSTER_NAME}" \
                            --region "${AWS_REGION}"

                        kubectl get nodes
                    '''
                }
            }
        }

        stage('Deploy NodeJS App on EKS') {
            steps {
                script {
                    echo "Deploying NodeJS App to EKS..."

                    sh '''
                        kubectl apply -f nodejsapp.yaml

                        echo "Checking deployment..."
                        kubectl get deployment nodejs-app

                        echo "Checking pods..."
                        kubectl get pods -l app=nodejs-app

                        echo "Checking service..."
                        kubectl get svc nodejs-service

                        echo "Waiting for LoadBalancer and Pod readiness..."

                        for i in {1..30}; do

                            HOSTNAME=$(kubectl get svc nodejs-service \
                                -o jsonpath="{.status.loadBalancer.ingress[0].hostname}" 2>/dev/null || true)

                            READY=$(kubectl get pods \
                                -l app=nodejs-app \
                                -o jsonpath="{.items[0].status.containerStatuses[0].ready}" 2>/dev/null || true)

                            if [ -n "$HOSTNAME" ] && [ "$READY" = "true" ]; then
                                echo "==========================================="
                                echo "NodeJS Application Deployed Successfully"
                                echo "Application URL: http://$HOSTNAME"
                                echo "==========================================="
                                break
                            fi

                            echo "Waiting... ($i/30)"
                            sleep 20
                        done
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }

        success {
            echo 'Jenkins pipeline completed successfully.'
        }

        failure {
            echo 'Jenkins pipeline failed. Check the console output.'
        }
    }
}
