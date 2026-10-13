# GameEducator - Frontend

Interface web do GameEducator, plataforma de ensino gamificada. A API fica no repositório
[gameeducator-backend](https://github.com/IHPNULL/gameeducator-backend).

**Stack:** Vue 3 · Vuetify · Vue Router · Vite · Vitest · Cucumber.js + Playwright

**Integrantes (Grupo 6):** Italo Haas Pascoli (190294) · Maria Eduarda Mota Zandonade (200953)

## Setup local (3 repositórios lado a lado)

```
gameeducator/                 # qualquer pasta
├── gameeducator-backend      # API + Jenkins local (jenkins/)
├── gameeducator-frontend     # app Vue
└── gameeducator-automation   # suítes Cucumber (API + UI)
```

```bash
mkdir gameeducator && cd gameeducator
for r in backend frontend automation; do git clone https://github.com/IHPNULL/gameeducator-$r.git; done
```

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
# backend a partir do checkout local em vez do GitHub: cp .env.example docker/.env
```

## Automação

A suíte de UI (Cucumber.js + Playwright) fica no repositório [gameeducator-automation](https://github.com/IHPNULL/gameeducator-automation).

## CI

`Jenkinsfile`: testes na imagem e build da imagem Nginx.
O job `gameeducator-frontend` do Jenkins local está descrito no repositório do backend (`jenkins/README.md`).
As portas 8080/5432 são as mesmas do backend: rode uma stack por vez.
