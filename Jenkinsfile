// Pipeline do frontend do GameEducator: roda os testes (Vitest) dentro da imagem,
// builda a imagem Nginx e roda a suite Cucumber+Playwright de UI contra o
// frontend real + um backend (perfil "automation") construido do repositorio
// gameeducator-backend.
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
        string(name: 'BACKEND_CONTEXT', defaultValue: 'https://github.com/IHPNULL/gameeducator-backend.git#main', description: 'Contexto de build do backend (URL Git ou caminho)')
    }

    environment {
        COMPOSE_PROJECT_NAME = "gameeducator-frontend-${env.BUILD_NUMBER}"
        BACKEND_CONTEXT = "${params.BACKEND_CONTEXT}"
    }

    stages {
        stage('Codigo-fonte') {
            steps {
                deleteDir()
                script {
                    if (env.LOCAL_SOURCE_DIR) {
                        sh """
                            tar -C "${env.LOCAL_SOURCE_DIR}" \\
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

        stage('Automacao: imagem ui-tests') {
            steps {
                sh "docker build -f docker/ui-tests.Dockerfile -t gameeducator-ui-tests:${IMAGE_TAG} ui-tests"
            }
        }

        stage('Automacao: Cucumber UI') {
            steps {
                // Constroi o backend a partir do repositorio gameeducator-backend e sobe ao lado do frontend ja construido.
                sh "docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml build backend"
                sh "docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml up -d --no-build backend frontend"
                sh '''
                    ok=0
                    for i in $(seq 1 45); do
                        if docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml exec -T frontend wget -q -O- http://127.0.0.1/v3/api-docs > /dev/null 2>&1; then
                            ok=1; break
                        fi
                        sleep 2
                    done
                    if [ "$ok" != "1" ]; then
                        echo "ERRO: backend (perfil automation) nao respondeu via frontend apos 90s" >&2
                        exit 1
                    fi
                '''
                sh "docker run --name ${COMPOSE_PROJECT_NAME}-ui-tests --network ${COMPOSE_PROJECT_NAME}_default gameeducator-ui-tests:${IMAGE_TAG}"
            }
            post {
                always {
                    sh "docker cp ${COMPOSE_PROJECT_NAME}-ui-tests:/app/reports ui-tests-reports || true"
                    sh "docker rm -f ${COMPOSE_PROJECT_NAME}-ui-tests || true"
                    sh 'docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml logs backend || true'
                    sh 'docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml down -v || true'
                    junit testResults: 'ui-tests-reports/junit-report.xml', allowEmptyResults: true
                    archiveArtifacts artifacts: 'ui-tests-reports/**', allowEmptyArchive: true
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
