<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { ITENS_DO_MENU } from './router/index.js'
import { usuarioAtual, definirUsuarioAtual } from './api/client.js'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const theme = useTheme()

const menuAberto = ref(true)
const usuarioId = ref(usuarioAtual() ?? 1)

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
  if (usuarioId.value === 1) return { nome: 'Professora Ana', papel: 'Professor', cor: 'secondary', avatar: 'mdi-account-tie' }
  if (usuarioId.value === 2) return { nome: 'Aluno Bruno', papel: 'Aluno', cor: 'primary', avatar: 'mdi-school' }
  if (usuarioId.value === 3) return { nome: 'Aluno Carlos', papel: 'Aluno', cor: 'info', avatar: 'mdi-school-outline' }
  return { nome: `Usuario #${usuarioId.value}`, papel: 'Custom', cor: 'primary', avatar: 'mdi-account' }
})

const PERSONAS = [
  { id: 1, label: 'Prof. Ana (1)', papel: 'Professor' },
  { id: 2, label: 'Bruno (2)', papel: 'Aluno' },
  { id: 3, label: 'Carlos (3)', papel: 'Aluno' },
]

function abrir(caminho) {
  router.push(caminho)
  if (!mdAndUp.value) {
    menuAberto.value = false
  }
}
</script>

<template>
  <v-app>
    <!-- Topbar moderna com vidro fosco (glassmorphism) -->
    <v-app-bar
      elevation="0"
      density="comfortable"
      class="ge-app-bar border-b px-2"
    >
      <v-app-bar-nav-icon
        v-if="!mdAndUp"
        aria-label="Abrir menu"
        @click="menuAberto = !menuAberto"
      />

      <div class="d-flex align-center ga-2 mr-4">
        <v-avatar color="primary" size="36" rounded="lg">
          <v-icon icon="mdi-gamepad-variant-outline" color="white" size="20" />
        </v-avatar>
        <div>
          <v-app-bar-title class="font-weight-bold text-subtitle-1 line-height-1">
            GameEducator
          </v-app-bar-title>
          <span class="text-caption text-medium-emphasis d-none d-sm-inline">
            Plataforma Gamificada de Aprendizagem
          </span>
        </div>
      </div>

      <v-spacer />

      <!-- Chip do Usuario Atual no Topbar -->
      <div class="d-flex align-center ga-2 mr-2">
        <v-chip
          :color="papelUsuario.cor"
          variant="tonal"
          size="default"
          class="font-weight-medium px-3"
          :prepend-icon="papelUsuario.avatar"
        >
          <span class="d-none d-sm-inline mr-1">{{ papelUsuario.nome }}</span>
          <span class="d-inline d-sm-none">#{{ usuarioId }}</span>
          <v-badge
            :content="papelUsuario.papel"
            inline
            color="primary"
            class="ml-1"
          />
        </v-chip>

        <!-- Alternar Tema Claro / Escuro -->
        <v-btn
          icon
          variant="text"
          size="small"
          aria-label="Alternar tema"
          @click="alternarTema"
        >
          <v-icon :icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'" />
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Drawer lateral moderno -->
    <v-navigation-drawer
      v-model="menuAberto"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      color="surface"
      width="272"
      elevation="0"
      class="border-e"
    >
      <div class="pa-3">
        <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis px-3 py-1">
          Navegacao
        </div>

        <v-list nav density="comfortable" class="pa-0">
          <v-btn
            v-for="item in ITENS_DO_MENU"
            :key="item.caminho"
            :prepend-icon="item.icone"
            :active="route.path === item.caminho"
            :color="route.path === item.caminho ? 'primary' : 'on-surface'"
            :variant="route.path === item.caminho ? 'flat' : 'text'"
            block
            class="justify-start mb-1 text-none text-body-2 font-weight-medium ge-nav-btn"
            @click="abrir(item.caminho)"
          >
            <span class="flex-grow-1 text-left">{{ item.titulo }}</span>
            <v-chip
              v-if="item.badge"
              size="x-small"
              :color="route.path === item.caminho ? 'white' : 'primary'"
              variant="flat"
              class="ml-1"
            >
              {{ item.badge }}
            </v-chip>
          </v-btn>
        </v-list>
      </div>

      <template #append>
        <div class="pa-3 border-t bg-surface-variant">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-medium-emphasis">Simular Usuario</span>
            <v-chip size="x-small" color="primary" variant="tonal">X-Usuario-Id</v-chip>
          </div>

          <!-- Botoes rapidos de persona -->
          <div class="d-flex ga-1 mb-2">
            <v-btn
              v-for="p in PERSONAS"
              :key="p.id"
              size="x-small"
              :variant="usuarioId === p.id ? 'flat' : 'outlined'"
              :color="usuarioId === p.id ? 'primary' : 'on-surface'"
              class="flex-grow-1"
              @click="salvarUsuario(p.id)"
            >
              {{ p.label }}
            </v-btn>
          </div>

          <!-- O input nativo number continua presente para Playwright e testes de automacao -->
          <v-text-field
            v-model.number="usuarioId"
            type="number"
            label="ID do Usuario"
            density="compact"
            variant="outlined"
            hide-details
            class="bg-surface"
            @change="salvarUsuario()"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Conteudo Principal -->
    <v-main class="bg-background">
      <v-container class="py-6 px-4 px-md-8 max-width-container">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.ge-app-bar {
  backdrop-filter: blur(12px);
  background-color: rgba(var(--v-theme-surface), 0.88) !important;
}

.max-width-container {
  max-width: 1200px;
}

.ge-nav-btn {
  height: 40px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.ge-nav-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
