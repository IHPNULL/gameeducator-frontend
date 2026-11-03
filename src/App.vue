<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { ITENS_DO_MENU } from './router/index.js'
import { usuarioAtual, definirUsuarioAtual } from './api/client.js'

const route = useRoute()
const router = useRouter()
const theme = useTheme()

const menuAberto = ref(true)
const usuarioId = ref(usuarioAtual() ?? 1)
const menuIniciarAberto = ref(false)
const menuSuperiorAberto = ref(null)
const modoCrt = ref(false)
const janelaMinimizada = ref(false)
const relogio = ref('')
const caixaSobre = ref(false)

// O campo ja aparece preenchido: grava o valor exibido para que a primeira
// requisicao tambem leve o X-Usuario-Id, sem depender de um "change" do usuario.
if (usuarioAtual() === null) {
  definirUsuarioAtual(usuarioId.value)
}

function salvarUsuario(novoId) {
  if (novoId !== undefined) {
    usuarioId.value = novoId
  }
  definirUsuarioAtual(usuarioId.value)
}

function alternarTema() {
  theme.global.name.value = theme.global.current.value.dark ? 'gameEducatorLight' : 'gameEducatorDark'
}

const papelUsuario = computed(() => {
  if (usuarioId.value === 1) return { nome: 'Professora Ana', papel: 'Professor' }
  if (usuarioId.value === 2) return { nome: 'Aluno Bruno', papel: 'Aluno' }
  if (usuarioId.value === 3) return { nome: 'Aluno Carlos', papel: 'Aluno' }
  if (usuarioId.value === 4) return { nome: 'Aluna Daniela', papel: 'Aluno' }
  if (usuarioId.value === 5) return { nome: 'Aluno Eduardo', papel: 'Aluno' }
  return { nome: `Usuario #${usuarioId.value}`, papel: 'Custom' }
})

const PERSONAS = [
  { id: 1, label: 'Prof. Ana (1)', papel: 'Professor' },
  { id: 2, label: 'Bruno (2)', papel: 'Aluno' },
  { id: 3, label: 'Carlos (3)', papel: 'Aluno' },
  { id: 4, label: 'Daniela (4)', papel: 'Aluno' },
  { id: 5, label: 'Eduardo (5)', papel: 'Aluno' },
]

/** Nome de arquivo "8.3" de cada modulo, para a arvore estilo Explorer. */
const ARQUIVOS = {
  '/missoes': 'MISSOES.EXE',
  '/nova-missao': 'NOVAMSN.EXE',
  '/notas': 'NOTAS.DBF',
  '/forum': 'FORUM.BBS',
  '/ranking': 'RANKING.DBF',
  '/painel-professor': 'PAINEL.EXE',
  '/assistente': 'ASSIST.COM',
  '/laboratorio': 'LABIOT.SYS',
}

const itemAtual = computed(() => ITENS_DO_MENU.find((i) => i.caminho === route.path))
const tituloJanela = computed(() => itemAtual.value?.titulo ?? 'Programa')

function abrir(caminho) {
  router.push(caminho)
  menuIniciarAberto.value = false
  menuSuperiorAberto.value = null
  janelaMinimizada.value = false
}

function alternarMenuSuperior(nome) {
  menuSuperiorAberto.value = menuSuperiorAberto.value === nome ? null : nome
}

function fecharMenus() {
  menuSuperiorAberto.value = null
  menuIniciarAberto.value = false
}

function atualizarRelogio() {
  relogio.value = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

let temporizador
onMounted(() => {
  atualizarRelogio()
  temporizador = setInterval(atualizarRelogio, 15000)
})
onBeforeUnmount(() => clearInterval(temporizador))
</script>

<template>
  <v-app :class="['ge-desktop', { 'crt-mode': modoCrt }]">
    <!-- Icones soltos na area de trabalho -->
    <div class="ge-icones-desktop" @click="fecharMenus">
      <button class="ge-icone-desktop" @dblclick="abrir('/missoes')">
        <span class="ge-icone-img">&#128187;</span>
        <span class="ge-icone-rotulo">Meu Computador</span>
      </button>
      <button class="ge-icone-desktop" @dblclick="abrir('/forum')">
        <span class="ge-icone-img">&#128172;</span>
        <span class="ge-icone-rotulo">Ambiente de Rede</span>
      </button>
      <button class="ge-icone-desktop" @dblclick="caixaSobre = true">
        <span class="ge-icone-img">&#128465;</span>
        <span class="ge-icone-rotulo">Lixeira</span>
      </button>
    </div>

    <!-- Janela principal do programa -->
    <div v-show="!janelaMinimizada" class="ge-janela win-raised">
      <div class="win-titlebar">
        <span class="win-titlebar-text">
          <span class="ge-mini-icone">&#9638;</span>
          GameEducator - [{{ tituloJanela }}]
        </span>
        <span class="win-titlebar-controls">
          <button class="win-control-btn" aria-label="Minimizar" @click="janelaMinimizada = true">_</button>
          <button class="win-control-btn" aria-label="Maximizar">&#9633;</button>
          <button class="win-control-btn ml-1" aria-label="Fechar" @click="caixaSobre = true">&#10005;</button>
        </span>
      </div>

      <!-- Barra de menus -->
      <div class="win-menubar ge-menubar">
        <div class="ge-menu-raiz">
          <span class="win-menu-item" :class="{ ativo: menuSuperiorAberto === 'arquivo' }" @click="alternarMenuSuperior('arquivo')"><u>A</u>rquivo</span>
          <div v-if="menuSuperiorAberto === 'arquivo'" class="ge-dropdown win-raised">
            <div class="win-start-item" @click="abrir('/nova-missao')">Nova missao...<span class="ge-atalho">Ctrl+N</span></div>
            <div class="win-start-item" @click="abrir('/notas')">Abrir boletim...<span class="ge-atalho">Ctrl+O</span></div>
            <div class="ge-sep-h" />
            <div class="win-start-item" @click="caixaSobre = true">Sair<span class="ge-atalho">Alt+F4</span></div>
          </div>
        </div>
        <div class="ge-menu-raiz">
          <span class="win-menu-item" :class="{ ativo: menuSuperiorAberto === 'modulos' }" @click="alternarMenuSuperior('modulos')"><u>M</u>odulos</span>
          <div v-if="menuSuperiorAberto === 'modulos'" class="ge-dropdown win-raised">
            <div v-for="item in ITENS_DO_MENU" :key="item.caminho" class="win-start-item" @click="abrir(item.caminho)">
              {{ route.path === item.caminho ? '&#10003;' : '&nbsp;&nbsp;' }} {{ item.titulo }}
            </div>
          </div>
        </div>
        <div class="ge-menu-raiz">
          <span class="win-menu-item" :class="{ ativo: menuSuperiorAberto === 'exibir' }" @click="alternarMenuSuperior('exibir')"><u>E</u>xibir</span>
          <div v-if="menuSuperiorAberto === 'exibir'" class="ge-dropdown win-raised">
            <div class="win-start-item" @click="menuAberto = !menuAberto; fecharMenus()">
              {{ menuAberto ? '&#10003;' : '&nbsp;&nbsp;' }} Arvore de modulos
            </div>
            <div class="win-start-item" @click="modoCrt = !modoCrt; fecharMenus()">
              {{ modoCrt ? '&#10003;' : '&nbsp;&nbsp;' }} Monitor CRT
            </div>
            <div class="win-start-item" @click="alternarTema(); fecharMenus()">&nbsp;&nbsp; Esquema fosforo verde</div>
          </div>
        </div>
        <div class="ge-menu-raiz">
          <span class="win-menu-item" @click="caixaSobre = true; fecharMenus()">Aj<u>u</u>da</span>
        </div>
      </div>

      <!-- Barra de ferramentas -->
      <div class="win-toolbar" @click="fecharMenus">
        <button class="win-btn ge-tool" title="Voltar" @click="router.back()">&#8592;</button>
        <button class="win-btn ge-tool" title="Avancar" @click="router.forward()">&#8594;</button>
        <span class="win-toolbar-sep" />
        <button
          v-for="item in ITENS_DO_MENU.slice(0, 5)"
          :key="item.caminho"
          :class="['win-btn', 'ge-tool', { 'ge-tool-on': route.path === item.caminho }]"
          :title="item.titulo"
          @click="abrir(item.caminho)"
        >
          <v-icon :icon="item.icone" size="14" />
        </button>
        <span class="win-toolbar-sep" />
        <span class="ge-endereco-rotulo">Endereco</span>
        <span class="win-sunken ge-endereco">C:\GAMEEDU\{{ ARQUIVOS[route.path] ?? 'MISSOES.EXE' }}</span>
      </div>

      <!-- Corpo: arvore (drawer) + documento -->
      <v-layout class="ge-corpo" @click="fecharMenus">
        <v-navigation-drawer
          v-model="menuAberto"
          permanent
          width="214"
          elevation="0"
          class="ge-arvore"
        >
          <div class="win-sunken ge-arvore-caixa">
            <div class="ge-no">&#128190; Disco local (C:)</div>
            <div class="ge-no ge-n1">&#128193; GAMEEDU</div>
            <div class="ge-titulo-app ge-n2">GameEducator</div>
            <div
              v-for="item in ITENS_DO_MENU"
              :key="item.caminho"
              :class="['ge-no', 'ge-n2', 'ge-arquivo', { selecionado: route.path === item.caminho }]"
              role="link"
              @click="abrir(item.caminho)"
            >
              <v-icon :icon="item.icone" size="13" class="mr-1" />{{ item.titulo }}
              <span v-if="item.badge" class="ge-badge">{{ item.badge }}</span>
            </div>
          </div>

          <fieldset class="win-groupbox ge-simular">
            <legend class="ge-legend">Simular usuario</legend>
            <div class="ge-quem">
              <span>{{ papelUsuario.nome }}</span>
              <span class="ge-papel">[{{ papelUsuario.papel }}]</span>
            </div>
            <div class="ge-personas">
              <button
                v-for="p in PERSONAS"
                :key="p.id"
                :class="['win-btn', 'ge-persona', { 'ge-persona-on': usuarioId === p.id }]"
                @click="salvarUsuario(p.id)"
              >
                {{ p.label }}
              </button>
            </div>
            <label class="ge-campo-id">
              <span><u>I</u>D do Usuario:</span>
              <!-- O input nativo number continua presente para Playwright e testes de automacao -->
              <input
                v-model.number="usuarioId"
                type="number"
                class="win-sunken ge-input-id"
                @change="salvarUsuario()"
              />
            </label>
            <div class="ge-header-hint">Header: X-Usuario-Id</div>
          </fieldset>
        </v-navigation-drawer>

        <v-main class="ge-main">
          <div class="win-sunken ge-documento">
            <router-view />
          </div>
        </v-main>
      </v-layout>

      <!-- Barra de status -->
      <div class="win-statusbar">
        <span class="win-sunken-panel ge-st-grow">Pronto</span>
        <span class="win-sunken-panel">API :8080</span>
        <span class="win-sunken-panel">USR={{ usuarioId }}</span>
        <span class="win-sunken-panel">CURSO=1</span>
        <span class="win-sunken-panel">NUM</span>
      </div>
    </div>

    <!-- Caixa de dialogo "Sobre" -->
    <div v-if="caixaSobre" class="ge-modal-fundo">
      <div class="ge-dialogo win-raised">
        <div class="win-titlebar">
          <span class="win-titlebar-text">Sobre o GameEducator</span>
          <button class="win-control-btn" aria-label="Fechar dialogo" @click="caixaSobre = false">&#10005;</button>
        </div>
        <div class="ge-dialogo-corpo">
          <span class="ge-dialogo-icone">&#9432;</span>
          <div>
            <strong>GameEducator versao 1.95</strong><br />
            Plataforma Gamificada de Aprendizagem<br />
            Copyright (C) Turma B1. Todos os direitos reservados.<br /><br />
            Memoria fisica disponivel: 65.536 KB<br />
            Recursos do sistema: 87% livres
          </div>
        </div>
        <div class="ge-dialogo-acoes">
          <button class="win-btn win-btn-default" @click="caixaSobre = false">OK</button>
        </div>
      </div>
    </div>

    <!-- Menu Iniciar -->
    <div v-if="menuIniciarAberto" class="win-start-menu">
      <div class="win-start-sidebar"><span>Game<b>Edu</b>95</span></div>
      <div class="win-start-items">
        <div v-for="item in ITENS_DO_MENU" :key="item.caminho" class="win-start-item" @click="abrir(item.caminho)">
          <v-icon :icon="item.icone" size="18" />{{ item.titulo }}
        </div>
        <div class="ge-sep-h" />
        <div class="win-start-item" @click="caixaSobre = true; menuIniciarAberto = false">
          <v-icon icon="mdi-power" size="18" />Desligar...
        </div>
      </div>
    </div>

    <!-- Barra de tarefas -->
    <div class="win-taskbar">
      <div class="d-flex align-center ga-1">
        <button
          :class="['win-start-btn', { active: menuIniciarAberto }]"
          @click="menuIniciarAberto = !menuIniciarAberto"
        >
          <span class="ge-logo-flag" />Iniciar
        </button>
        <span class="win-toolbar-sep" />
        <button
          :class="['win-start-btn', 'ge-tarefa', { active: !janelaMinimizada }]"
          @click="janelaMinimizada = !janelaMinimizada"
        >
          &#9638; GameEducator - {{ tituloJanela }}
        </button>
      </div>
      <div class="win-systray">
        <button class="ge-tray-btn" :title="modoCrt ? 'Desligar CRT' : 'Ligar CRT'" @click="modoCrt = !modoCrt">
          <v-icon icon="mdi-monitor" size="14" />
        </button>
        <button class="ge-tray-btn" aria-label="Alternar tema" title="Alternar tema" @click="alternarTema">
          <v-icon :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'" size="14" />
        </button>
        <span>{{ relogio }}</span>
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.ge-desktop {
  background-color: var(--win-desktop) !important;
  min-height: 100vh;
}

.ge-icones-desktop {
  position: fixed;
  top: 10px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 0;
}

.ge-icone-desktop {
  width: 74px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: 1px dotted transparent;
  cursor: default;
}

.ge-icone-desktop:focus .ge-icone-rotulo {
  background: var(--win-selection);
  border: 1px dotted #ffff00;
}

.ge-icone-img {
  font-size: 30px;
  line-height: 1;
}

.ge-icone-rotulo {
  color: #fff;
  font-size: 11px;
  text-align: center;
  padding: 0 2px;
  border: 1px dotted transparent;
}

.ge-janela {
  position: relative;
  margin: 8px 8px 38px 92px;
  height: calc(100vh - 46px);
  display: flex;
  flex-direction: column;
  padding: 2px;
  z-index: 1;
}

.ge-mini-icone {
  font-size: 12px;
}

.ge-menubar {
  position: relative;
  z-index: 50;
}

.ge-menu-raiz {
  position: relative;
}

.win-menu-item.ativo {
  background-color: var(--win-blue-title);
  color: #fff;
}

.ge-dropdown {
  position: absolute;
  top: 18px;
  left: 0;
  min-width: 210px;
  padding: 2px;
  z-index: 100;
}

.ge-atalho {
  margin-left: auto;
  padding-left: 20px;
}

.ge-sep-h {
  height: 2px;
  margin: 3px 2px;
  border-top: 1px solid var(--win-gray-dark);
  border-bottom: 1px solid var(--win-white);
}

.ge-tool {
  min-width: 26px !important;
  height: 24px !important;
  padding: 0 5px !important;
  font-size: 13px !important;
}

.ge-tool-on {
  border-top: 2px solid var(--win-black) !important;
  border-left: 2px solid var(--win-black) !important;
  border-right: 2px solid var(--win-white) !important;
  border-bottom: 2px solid var(--win-white) !important;
  background-image: repeating-conic-gradient(var(--win-gray) 0 25%, var(--win-white) 0 50%) !important;
  background-size: 2px 2px !important;
}

.ge-endereco-rotulo {
  font-size: 11px;
  margin-right: 4px;
}

.ge-endereco {
  flex: 1;
  min-width: 160px;
  padding: 2px 6px;
  font-family: var(--win-font-mono);
  font-size: 11px;
}

.ge-corpo {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-color: var(--win-gray);
}

.ge-arvore {
  background-color: var(--win-gray) !important;
  border: none !important;
  padding: 4px;
}

.ge-arvore :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.ge-arvore-caixa {
  padding: 4px;
  font-size: 11px;
  flex: 1;
  min-height: 180px;
}

.ge-no {
  padding: 1px 3px;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}

.ge-n1 { padding-left: 14px; }
.ge-n2 { padding-left: 26px; }

.ge-titulo-app {
  font-size: 11px;
  font-weight: bold;
  padding-top: 2px;
  padding-bottom: 2px;
}

.ge-arquivo {
  cursor: pointer;
  border: 1px dotted transparent;
}

.ge-arquivo.selecionado {
  background-color: var(--win-selection);
  color: var(--win-selection-text);
  border: 1px dotted #ffff00;
}

.ge-badge {
  font-size: 9px;
  padding: 0 3px;
  margin-left: 3px;
  border: 1px solid currentColor;
}

.ge-simular {
  margin: 4px 0 0 0 !important;
  font-size: 11px;
}

.ge-legend {
  font-weight: bold;
  padding: 0 3px;
}

.ge-quem {
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.ge-papel {
  font-weight: normal;
  font-family: var(--win-font-mono);
}

.ge-personas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  margin-bottom: 6px;
}

.ge-persona {
  font-size: 10px !important;
  font-weight: normal !important;
  padding: 1px 2px !important;
  min-height: 20px !important;
}

.ge-persona-on {
  font-weight: bold !important;
  border-top: 2px solid var(--win-black) !important;
  border-left: 2px solid var(--win-black) !important;
  border-right: 2px solid var(--win-white) !important;
  border-bottom: 2px solid var(--win-white) !important;
}

.ge-campo-id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.ge-input-id {
  width: 60px;
  padding: 2px 4px;
  font-family: var(--win-font-mono);
  font-size: 11px;
  outline: none;
}

.ge-header-hint {
  margin-top: 4px;
  font-family: var(--win-font-mono);
  font-size: 10px;
  color: var(--win-gray-dark);
}

.ge-main {
  height: 100%;
  padding-top: 4px !important;
  padding-right: 4px !important;
  padding-bottom: 4px !important;
}

.ge-documento {
  height: 100%;
  overflow-y: auto;
  padding: 10px 12px;
  background-color: var(--win-gray) !important;
}

.ge-st-grow {
  flex: 1;
}

.ge-modal-fundo {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
}

.ge-dialogo {
  width: 360px;
  padding: 2px;
}

.ge-dialogo-corpo {
  display: flex;
  gap: 12px;
  padding: 14px 12px 8px;
  font-size: 11px;
  line-height: 1.5;
}

.ge-dialogo-icone {
  font-size: 30px;
  color: #000080;
  line-height: 1;
}

.ge-dialogo-acoes {
  display: flex;
  justify-content: center;
  padding: 6px 0 10px;
}

.ge-dialogo-acoes .win-btn {
  min-width: 76px;
}

.ge-logo-flag {
  width: 16px;
  height: 14px;
  display: inline-block;
  background:
    linear-gradient(90deg, #ff0000 50%, #00a000 50%) top / 100% 50% no-repeat,
    linear-gradient(90deg, #0000ff 50%, #ffcc00 50%) bottom / 100% 50% no-repeat;
  transform: skewY(-6deg);
}

.ge-tarefa {
  min-width: 200px;
  max-width: 280px;
  justify-content: flex-start;
  font-weight: normal;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ge-tarefa.active {
  font-weight: bold;
  background-image: repeating-conic-gradient(var(--win-gray) 0 25%, var(--win-white) 0 50%);
  background-size: 2px 2px;
}

.ge-tray-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--win-black);
  display: flex;
}
</style>
