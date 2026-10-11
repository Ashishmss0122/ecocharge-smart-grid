
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Tools') {
            steps {
                bat 'whoami'
                bat 'where bun'
                bat 'where docker'
                bat 'docker --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '"C:\\Users\\khaja\\.bun\\bin\\bun.exe" install --frozen-lockfile'
            }
        }

        stage('Lint') {
            steps {
                bat '"C:\\Users\\khaja\\.bun\\bin\\bun.exe" run lint'
            }
        }

        stage('Type Check') {
            steps {
                bat '"C:\\Users\\khaja\\.bun\\bin\\bun.exe" run typecheck'
            }
        }

        stage('Test') {
            steps {
                bat '"C:\\Users\\khaja\\.bun\\bin\\bun.exe" run test:run'
            }
        }

        stage('Check Docker') {
            steps {
                bat 'where docker'
                bat 'docker --version'
                bat 'docker info'
            }
        }

        stage('Build') {
            steps {
                bat '"C:\\Users\\khaja\\.bun\\bin\\bun.exe" run build'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t ecocharge:1.0 .'
            }
        }

        stage('Deploy Locally') {
            steps {
                bat 'docker rm -f ecocharge-app 2>NUL || exit /b 0'
                bat 'docker run -d --restart unless-stopped --name ecocharge-app -p 3000:3000 ecocharge:1.0'
            }
        }
    }

    post {
        success {
            echo 'EcoCharge pipeline completed successfully.'
            echo 'Test the application at http://localhost:3000'
        }

        failure {
            echo 'Pipeline failed. Check the first failing stage in Console Output.'
        }
    }
}
