
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        IMAGE_NAME = 'ecocharge'
        IMAGE_TAG = '1.0'
        CONTAINER_NAME = 'ecocharge-app'
        HOST_PORT = '3000'
        CONTAINER_PORT = '3000'
        DOCKER = 'DOCKER = 'C:\\Users\\khaja\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe''
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Docker') {
            steps {
                bat '"%DOCKER%" --version'
                bat '"%DOCKER%" info'
            }
        }

        stage('Check Project Files') {
            steps {
                bat 'if not exist package.json exit /b 1'
                bat 'if not exist Dockerfile exit /b 1'
                bat 'if not exist bun.lock exit /b 1'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/app" -w /app oven/bun:1 bun install --frozen-lockfile'
            }
        }

        stage('Fix Line Endings') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/app" -w /app oven/bun:1 bunx prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"'
            }
        }

        stage('Lint') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/app" -w /app oven/bun:1 bun run lint'
            }
        }

        stage('Type Check') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/app" -w /app oven/bun:1 bun run typecheck'
            }
        }

        stage('Tests') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/app" -w /app oven/bun:1 bun run test:run'
            }
        }

        stage('Build Application') {
            steps {
                bat 'docker run --rm -v "%WORKSPACE%:/app" -w /app oven/bun:1 bun run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '"%DOCKER%" build -t %IMAGE_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Deploy Application') {
            steps {
                bat '''
                    "%DOCKER%" rm -f %CONTAINER_NAME% 2>NUL
                    "%DOCKER%" run -d --name %CONTAINER_NAME% -p %HOST_PORT%:%CONTAINER_PORT% %IMAGE_NAME%:%IMAGE_TAG%
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                bat '"%DOCKER%" ps --filter "name=%CONTAINER_NAME%"'
                bat '"%DOCKER%" logs --tail 50 %CONTAINER_NAME%'
            }
        }
    }

    post {
        success {
            echo 'EcoCharge pipeline completed successfully.'
            echo 'Check your application at http://localhost:3000'
        }

        failure {
            echo 'Pipeline failed. Check the first failed stage in the console output.'
        }

        always {
            echo 'EcoCharge Jenkins pipeline finished.'
        }
    }
}
