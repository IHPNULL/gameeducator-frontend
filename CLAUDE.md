# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

GameEducator frontend: Vue 3 + Vuetify + Vite + vue-router, tested with Vitest. The Spring Boot API lives in the separate `gameeducator-backend` repo. Code and identifiers are in Portuguese (no accents in code) — match that.

## Commands

```bash
npm ci
npm run dev                       # :5173, Vite proxies /api to http://localhost:8080 (backend must be running)
npm test                          # vitest run (tests/unit + tests/bdd)
npx vitest run tests/unit/api-client.spec.js   # one file
npm run test:coverage             # report in coverage/
npm run build
```

UI automation (Cucumber.js + Playwright) lives in the separate `gameeducator-automation` repo. `docker/docker-compose.yml` builds the backend from the Git repo `gameeducator-backend` (override with `BACKEND_CONTEXT=<path or url>`); For local sources instead of GitHub: `cp .env.example docker/.env` (paths relative to `docker/`). The stack shares ports 8080/5432 with the backend repo's compose. In the local Jenkins the job is `gameeducator-frontend` (defined in the backend repo's `jenkins/`). `Jenkinsfile` runs tests in the image and builds the Nginx image. Docker build context is the repo root for `docker/frontend.Dockerfile`.

## Architecture

`src/views/*View.vue` (one per route in `router/index.js`) are pages; data access lives in `src/composables/use*.js` (one per feature), which call the thin `fetch` wrapper in `src/api/client.js`; shared UI in `src/components/`. The current user is an id stored in `localStorage` (`gameeducator.usuarioId`) and sent as the `X-Usuario-Id` header on every request — the backend has no real auth.

`VITE_API_BASE_URL` is empty in Docker (relative `/api/...` paths, proxied by Nginx via `docker/nginx.conf`, whose upstream hostname `backend` must match the compose service name); `.env` points at `http://localhost:8080` for dev.

`tests/bdd/*.spec.js` mirror the backend's BDD acceptance scenarios.
