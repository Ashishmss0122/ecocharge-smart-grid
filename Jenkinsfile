
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        IMAGE_NAME = 'ecocharge:1.0'
        CONTAINER_NAME = 'ecocharge-app'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Prerequisites') {
            steps {
                bat 'docker --version'
                bat 'docker info'
                bat 'if not exist package.json (echo ERROR: package.json not found & exit /b 1)'
                bat 'if not exist Dockerfile (echo ERROR: Dockerfile not found & exit /b 1)'
                bat 'docker run --rm oven/bun:1 bun --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun install --frozen-lockfile'
            }
        }

        stage('Lint') {
            steps {
                bat 'docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run lint'
            }
        }

        stage('Type Check') {
            steps {
                bat 'docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run typecheck'
            }
        }

        stage('Test') {
            steps {
                bat 'docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run test:run'
            }
        }

        stage('Build Application') {
            steps {
                bat 'docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME% .'
            }
        }

        stage('Deploy Locally') {
            steps {
                bat 'docker rm -f %CONTAINER_NAME% 2>NUL || exit /b 0'
                bat 'docker run -d --restart unless-stopped --name %CONTAINER_NAME% -p 3000:3000 %IMAGE_NAME%'
            }
        }

        stage('Verify Deployment') {
            steps {
                bat 'docker ps --filter "name=%CONTAINER_NAME%"'
                bat 'docker logs --tail 50 %CONTAINER_NAME%'
            }
        }
    }

    post {
        success {
            echo 'EcoCharge pipeline completed successfully.'
            echo 'Try opening http://localhost:3000'
        }

        failure {
            echo 'Pipeline failed. Read the first failing stage in Console Output.'
        }

        always {
            echo 'EcoCharge pipeline execution finished.'
        }
    }
}
