pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/TungTran-engineer/food_devops.git'
            }
        }

        stage('Build & Deploy with Docker Compose') {
            steps {
                sh '''
                docker-compose down
                docker-compose up --build -d
                '''
            }
        }
    }
}