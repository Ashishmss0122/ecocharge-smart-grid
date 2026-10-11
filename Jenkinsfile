
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'bun install --frozen-lockfile'
            }
        }

        stage('Lint') {
            steps {
                bat 'bun run lint'
            }
        }

        stage('Type Check') {
            steps {
                bat 'bun run typecheck'
            }
        }

        stage('Test') {
            steps {
                bat 'bun run test:run'
            }
        }

        stage('Build') {
            steps {
                bat 'bun run build'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t ecocharge:1.0 .'
            }
        }

        stage('Deploy Locally') {
            steps {
                bat 'docker rm -f ecocharge-app || exit /b 0'
                bat 'docker run -d --restart unless-stopped --name ecocharge-app -p 3000:3000 ecocharge:1.0'
            }
        }
    }
}
