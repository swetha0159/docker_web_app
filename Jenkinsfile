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

       stage('Create/Check EKS Cluster') {
    steps {
        script {
            echo "Checking if EKS Cluster '${CLUSTER_NAME}' exists..."

            def clusterExists = sh(
                script: "eksctl get cluster --name ${CLUSTER_NAME} --region ${AWS_REGION}",
                returnStatus: true
            ) == 0

            if (!clusterExists) {
                echo "Cluster does not exist. Creating the EKS Cluster..."

                sh """
                    eksctl create cluster \
                        --name ${CLUSTER_NAME} \
                        --region ${AWS_REGION} \
                        --nodegroup-name worker-nodes \
                        --node-type c7i-flex.large \
                        --nodes 2 \
                        --managed
                """
            } else {
                echo "Cluster already exists. Skipping creation."
            }

            echo "Updating kubeconfig..."

            sh """
                aws eks update-kubeconfig \
                    --name ${CLUSTER_NAME} \
                    --region ${AWS_REGION}
            """

            echo "EKS Cluster configuration completed successfully."
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
