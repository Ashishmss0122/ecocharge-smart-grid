
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        PATH_PLUS_DOCKER = 'C:\\Program Files\\Docker\\Docker\\resources\\bin'
        IMAGE_NAME = 'ecocharge:1.0'
        CONTAINER_NAME = 'ecocharge-app'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Docker') {
            steps {
                script {
                    def dockerPath = 'C:\\Program Files\\Docker\\Docker\\resources\\bin'
                    env.PATH = "${dockerPath};${env.PATH}"
                }

                bat '''
                    @echo off
                    echo Checking Docker installation...
                    where docker
                    if errorlevel 1 (
                        echo ERROR: Docker CLI was not found.
                        echo Install Docker Desktop or add its installation folder to PATH.
                        exit /b 1
                    )
                    docker --version
                '''

                bat '''
                    @echo off
                    echo Checking Docker engine...
                    docker info
                    if errorlevel 1 (
                        echo ERROR: Docker engine is not available to Jenkins.
                        echo Start Docker Desktop and check Jenkins service permissions.
                        exit /b 1
                    )
                '''
            }
        }

        stage('Check Project Files') {
            steps {
                bat '''
                    @echo off
                    if not exist package.json (
                        echo ERROR: package.json is missing.
                        exit /b 1
                    )
                    if not exist Dockerfile (
                        echo ERROR: Dockerfile is missing.
                        exit /b 1
                    )
                    echo Project files found.
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                    @echo off
                    docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun install --frozen-lockfile
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Lint') {
            steps {
                bat '''
                    @echo off
                    docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run lint
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Type Check') {
            steps {
                bat '''
                    @echo off
                    docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run typecheck
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Test') {
            steps {
                bat '''
                    @echo off
                    docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run test:run
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Build Application') {
            steps {
                bat '''
                    @echo off
                    docker run --rm -v "%CD%:/app" -w /app oven/bun:1 bun run build
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '''
                    @echo off
                    docker build -t %IMAGE_NAME% .
                    if errorlevel 1 exit /b 1
                '''
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
                bat '''
                    @echo off
                    docker ps --filter "name=%CONTAINER_NAME%"
                    docker logs --tail 50 %CONTAINER_NAME%
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
            echo 'Check http://localhost:3000'
        }

        failure {
            echo 'Pipeline failed. Open Console Output and find the first ERROR.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
