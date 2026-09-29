# GameEducator - Frontend

Interface web do GameEducator, plataforma de ensino gamificada. A API fica no repositório
[gameeducator-backend](https://github.com/IHPNULL/gameeducator-backend).

**Stack:** Vue 3 · Vuetify · Vue Router · Vite · Vitest · Cucumber.js + Playwright

**Integrantes (Grupo 6):** Italo Haas Pascoli (190294) · Maria Eduarda Mota Zandonade (200953)

## Como rodar

Suba o backend (`./mvnw spring-boot:run` no repositório do backend, porta 8080) e depois:

```bash
npm ci
npm run dev             # http://localhost:5173 (o Vite faz proxy de /api para :8080)
npm test                # Vitest (unit + BDD)
npm run test:coverage   # cobertura em coverage/
npm run build
```

`VITE_API_BASE_URL` (veja `.env`) define a origem do backend; vazio = caminhos relativos `/api/...`
(proxy do Vite ou do Nginx).

## Docker

```bash
docker compose -f docker/docker-compose.yml up --build   # frontend :8081 + backend (construído do repo gameeducator-backend) :8080 + Postgres
# backend local: BACKEND_CONTEXT=../gameeducator-backend docker compose -f docker/docker-compose.yml up --build
```

## Automação de UI (Cucumber.js + Playwright)

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml up -d --build backend frontend
cd ui-tests
npm ci
npx playwright install --with-deps chromium   # só na 1ª vez
npm test                                      # AUTOMATION_FRONTEND_URL=http://outro para outro host
docker compose -f ../docker/docker-compose.yml -f ../docker/docker-compose.automation.yml down -v
```

Relatórios: `ui-tests/reports/cucumber-report.html` e `reports/junit-report.xml`.

## CI

`Jenkinsfile`: testes na imagem, build da imagem Nginx e suíte de UI contra o backend real.
O Jenkins local está descrito no repositório do backend (`jenkins/README.md`).
