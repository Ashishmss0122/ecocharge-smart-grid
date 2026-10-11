
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        DOCKER_BIN = 'C:\\Program Files\\Docker\\Docker\\resources\\bin'
        IMAGE_NAME = 'ecocharge:1.0'
        CONTAINER_NAME = 'ecocharge-app'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Configure Docker') {
            steps {
                script {
                    env.PATH = "${env.DOCKER_BIN};${env.PATH}"
                }

                bat '''
                    @echo off
                    echo Checking Docker CLI...
                    where docker
                    if errorlevel 1 (
                        echo ERROR: Jenkins cannot find docker.exe.
                        exit /b 1
                    )
                    docker --version
                '''

                bat '''
                    @echo off
                    echo Checking Docker Engine...
                    docker info
                    if errorlevel 1 (
                        echo ERROR: Jenkins cannot connect to Docker Engine.
                        echo Check Docker Desktop and Jenkins service permissions.
                        exit /b 1
                    )
                '''
            }
        }

        stage('Check Project') {
            steps {
                bat '''
                    @echo off
                    if not exist package.json (
                        echo ERROR: package.json not found.
                        exit /b 1
                    )
                    if not exist Dockerfile (
                        echo ERROR: Dockerfile not found.
                        exit /b 1
                    )
                    echo Project files verified.
                '''
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

        stage('Deploy Application') {
            steps {
                bat '''
                    @echo off
                    docker rm -f %CONTAINER_NAME% 2>NUL
                    docker run -d --restart unless-stopped --name %CONTAINER_NAME% -p 3000:3000 %IMAGE_NAME%
                    if errorlevel 1 exit /b 1
                '''
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
            echo 'Open http://localhost:3000 to test the application.'
        }

        failure {
            echo 'Pipeline failed. Check the first failing stage in Console Output.'
        }

        always {
            echo 'EcoCharge pipeline execution finished.'
        }
    }
}
