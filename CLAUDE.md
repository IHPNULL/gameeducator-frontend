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

UI automation (Cucumber.js + Playwright in `ui-tests/`, needs frontend + backend up in the backend's `automation` profile):
```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml up -d --build backend frontend   # :8080 / :8081
cd ui-tests && npm ci && npx playwright install --with-deps chromium && npm test   # AUTOMATION_FRONTEND_URL=... to override
docker compose -f docker/docker-compose.yml -f docker/docker-compose.automation.yml down -v
```
The compose file builds the backend from the Git repo `gameeducator-backend` (override with `BACKEND_CONTEXT=<path or url>`). `Jenkinsfile` runs tests in the image, builds the Nginx image and runs the UI suite. Docker build context is the repo root for `frontend.Dockerfile`, and `ui-tests/` for `ui-tests.Dockerfile`.

## Architecture

`src/views/*View.vue` (one per route in `router/index.js`) are pages; data access lives in `src/composables/use*.js` (one per feature), which call the thin `fetch` wrapper in `src/api/client.js`; shared UI in `src/components/`. The current user is an id stored in `localStorage` (`gameeducator.usuarioId`) and sent as the `X-Usuario-Id` header on every request — the backend has no real auth.

`VITE_API_BASE_URL` is empty in Docker (relative `/api/...` paths, proxied by Nginx via `docker/nginx.conf`, whose upstream hostname `backend` must match the compose service name); `.env` points at `http://localhost:8080` for dev.

`tests/bdd/*.spec.js` mirror the backend's BDD acceptance scenarios; `ui-tests/src/features/*.feature` (steps in `ui-tests/src/steps`, hooks/world in `ui-tests/src/support`) depend on the backend's `automation` seed data (`AutomationSeedData` in the backend repo).
