// Pipeline do frontend do GameEducator: roda os testes (Vitest) dentro da imagem
// e builda a imagem Nginx. A automacao Cucumber+Playwright fica no repo
// gameeducator-automation.
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 40, unit: 'MINUTES')
        skipDefaultCheckout()
    }

    parameters {
        string(name: 'DOCKER_REGISTRY', defaultValue: '', description: 'Docker registry host para publicar a imagem em main')
    }

    environment {
        COMPOSE_PROJECT_NAME = "gameeducator-frontend-${env.BUILD_NUMBER}"
    }

    stages {
        stage('Codigo-fonte') {
            steps {
                deleteDir()
                script {
                    if (env.LOCAL_SOURCES_ROOT) {
                        sh """
                            tar -C "${env.LOCAL_SOURCES_ROOT}/gameeducator-frontend" \\
                                --exclude=.git --exclude=node_modules --exclude=ui-tests/reports \\
                                -cf - . | tar -xf -
                        """
                    } else {
                        checkout scm
                    }
                }
                script {
                    env.IMAGE_TAG = sh(returnStdout: true, script: '''
                        if [ -n "$GIT_COMMIT" ]; then
                            echo "$GIT_COMMIT" | cut -c1-12
                        else
                            echo "local-${BUILD_NUMBER}"
                        fi
                    ''').trim()
                    echo "IMAGE_TAG=${env.IMAGE_TAG}  COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT_NAME}"
                }
            }
        }

        stage('Frontend: testes') {
            steps {
                sh "docker build -f docker/frontend.Dockerfile --target test -t gameeducator-frontend:${IMAGE_TAG}-test ."
                sh "docker run --name ${COMPOSE_PROJECT_NAME}-frontend-test gameeducator-frontend:${IMAGE_TAG}-test"
            }
            post {
                always {
                    sh "docker cp ${COMPOSE_PROJECT_NAME}-frontend-test:/app/reports frontend-reports || true"
                    sh "docker rm -f ${COMPOSE_PROJECT_NAME}-frontend-test || true"
                    junit testResults: 'frontend-reports/junit.xml', allowEmptyResults: true
                    archiveArtifacts artifacts: 'frontend-reports/coverage/**', allowEmptyArchive: true
                }
            }
        }

        stage('Frontend: imagem') {
            steps {
                sh "docker build -f docker/frontend.Dockerfile -t gameeducator-frontend:${IMAGE_TAG} ."
                script {
                    if (env.BRANCH_NAME == 'main') {
                        sh "docker tag gameeducator-frontend:${IMAGE_TAG} gameeducator-frontend:latest"
                    }
                }
            }
        }

        stage('Publish') {
            when {
                branch 'main'
            }
            steps {
                script {
                    if (!params.DOCKER_REGISTRY) {
                        echo 'DOCKER_REGISTRY nao configurado - pulando publicacao da imagem.'
                        return
                    }
                    docker.withRegistry("https://${params.DOCKER_REGISTRY}", 'gameeducator-docker-registry') {
                        sh "docker tag gameeducator-frontend:latest ${params.DOCKER_REGISTRY}/gameeducator-frontend:latest"
                        sh "docker push ${params.DOCKER_REGISTRY}/gameeducator-frontend:latest"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.IMAGE_TAG) {
                    sh "docker rmi gameeducator-frontend:${env.IMAGE_TAG}-test || true"
                }
            }
        }
    }
}
