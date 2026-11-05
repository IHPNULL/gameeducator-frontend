# GameEducator - Frontend

Interface web do GameEducator: plataforma educacional gamificada com temática retro workstation inspirada em interfaces gráficas clássicas dos anos 90 (estilo Windows 95 / OS Utilitário) na paleta `#5c7fb8`. A API Core fica no repositório [gameeducator-backend](https://github.com/IHPNULL/gameeducator-backend) e o serviço de IA no [gameeducator-ia](https://github.com/IHPNULL/gameeducator-ia).

**Stack:** Vue 3 · Vuetify 3 · Vue Router · Vite 8 · Vitest · Cucumber.js + Playwright

**Integrantes (Grupo 6):** Italo Haas Pascoli (190294) · Maria Eduarda Mota Zandonade (200953)

## Interface Retrô (Retro Workstation)

- **Desktop OS Clássico:** Fundo azul-ardósia (`#5c7fb8`), ícones soltos (*Meu Computador*, *Ambiente de Rede*, *Lixeira*), barra de título com botões `[_]`, `[□]`, `[✕]`.
- **Navegação & Casca:** Barra de Menus funcional (*Arquivo*, *Módulos*, *Exibir* com modo CRT/Scanlines e *Ajuda*), Barra de Ferramentas com atalhos, Árvore Explorer (`C:\GAMEEDU`) e Barra de Tarefas com botão **[ Iniciar ]**, janelas ativas e bandeja (Systray) com relógio digital em tempo real.
- **Micro-interações Táteis:** Botões 3D double-bevel que afundam fisicamente 1px ao clique, retângulos de foco pontilhados e fontes de sistema (`MS Sans Serif`, `Lucida Console`).
- **Módulos Integrados:**
  - `MissoesView`: barra de progresso em blocos segmentados (`■■■■■■□□□□`), visores LCD e alternativas táteis.
  - `RankingView`: grid estilo banco de dados (`RANKING.DBF`), destaque `.ranking-eu` e quadro de medalhas.
  - `PainelProfessorView`: instrumentação e diálogo modal Win95 nativo para lançamento de notas.
  - `AssistenteView`: terminal estilo console DOS (`C:\IA>`) integrado com FastAPI / RAG.
  - `LaboratorioView`: console industrial SCADA com LEDs de status e telemetria de eventos IoT.
  - `NotasView` & `ForumView`: boletim escolar em planilha pautada e leitor estilo BBS / Usenet.

## Setup local (4 repositórios lado a lado)

```
gameeducator/                 # pasta raiz
├── gameeducator-backend      # API REST Core + Jenkins local (jenkins/) + Mini-labs (labs/)
├── gameeducator-frontend     # app Vue (estacao de trabalho anos 90)
├── gameeducator-ia           # servico de IA Python (FastAPI)
└── gameeducator-automation   # suítes Cucumber (API + UI)
```

```bash
mkdir gameeducator && cd gameeducator
for r in backend frontend ia automation; do git clone https://github.com/IHPNULL/gameeducator-$r.git; done
```

## Como rodar

Suba o backend (`./mvnw spring-boot:run` no repositório do backend, porta 8080) e depois:

```bash
npm ci
npm run dev             # http://localhost:5173 (o Vite faz proxy de /api para :8080)
npm test                # Vitest (15 suites unitarias e BDD - 59 testes verdes)
npm run test:coverage   # cobertura em coverage/ (95% de cobertura)
npm run build           # build de producao
```

`VITE_API_BASE_URL` (veja `.env`) define a origem do backend; vazio = caminhos relativos `/api/...`
(proxy do Vite ou do Nginx).

## Docker

```bash
docker compose -f docker/docker-compose.yml up --build   # frontend :8081 + backend :8080 + Postgres
# backend a partir do checkout local em vez do GitHub: cp .env.example docker/.env
```

## Automação E2E

A suíte de UI (Cucumber.js + Playwright) fica no repositório [gameeducator-automation](https://github.com/IHPNULL/gameeducator-automation).

## CI / CD

`Jenkinsfile`: build multi-stage, execução de testes unitários e BDD na imagem, build da imagem Nginx e estágio de deploy em homologação (staging simulado).
O job `gameeducator-frontend` do Jenkins local está descrito no repositório do backend (`jenkins/README.md`).
