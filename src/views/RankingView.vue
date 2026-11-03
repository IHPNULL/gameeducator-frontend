<script setup>
import { onMounted } from 'vue'
import { useRanking } from '../composables/useRanking.js'
import { useMedalhas } from '../composables/useMedalhas.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { ranking, carregando, erro, carregar, souEu } = useRanking(props.cursoId)
const { medalhas, carregarMedalhas } = useMedalhas(props.cursoId)

/** Medalhas de destaque para o podio */
const CORES_DO_PODIO = { 1: '#F59E0B', 2: '#94A3B8', 3: '#B45309' }

const CONQUISTAS_POSSIVEIS = [
  { marco: 50, titulo: 'Iniciante', icone: 'mdi-star-outline', descricao: 'Alcancou 50 XP' },
  { marco: 100, titulo: 'Aprendiz', icone: 'mdi-shield-star', descricao: 'Alcancou 100 XP' },
  { marco: 250, titulo: 'Mestre', icone: 'mdi-crown-outline', descricao: 'Alcancou 250 XP' },
  { marco: 500, titulo: 'Lenda', icone: 'mdi-trophy-award', descricao: 'Alcancou 500 XP' },
]

function possuiMedalha(marco) {
  return medalhas.value.some((m) => m.marcoXp === marco)
}

onMounted(() => {
  carregar()
  carregarMedalhas()
})
</script>

<template>
  <section class="ge-ranking-page">
    <CabecalhoPagina
      titulo="Ranking da turma"
      subtitulo="Acompanhe a classificacao de XP dos alunos e veja suas conquistas desbloqueadas"
      icone="mdi-trophy"
    >
      <template #acao>
        <v-chip color="warning" variant="flat" size="large" prepend-icon="mdi-crown">
          Temporada Ativa
        </v-chip>
      </template>
    </CabecalhoPagina>

    <!-- Galeria de Conquistas / Medalhas do Aluno -->
    <v-card class="mb-6 pa-4 ge-conquistas-card" elevation="0">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-medal-outline" color="warning" size="22" />
          <span class="text-subtitle-1 font-weight-bold">Quadro de Medalhas</span>
        </div>
        <span class="text-caption text-medium-emphasis">
          {{ medalhas.length }} de {{ CONQUISTAS_POSSIVEIS.length }} desbloqueadas
        </span>
      </div>

      <v-row density="compact">
        <v-col
          v-for="c in CONQUISTAS_POSSIVEIS"
          :key="c.marco"
          cols="6"
          sm="3"
        >
          <v-card
            variant="outlined"
            :class="[
              'pa-3 text-center rounded-xl ge-badge-card',
              possuiMedalha(c.marco) ? 'ge-badge-desbloqueada' : 'ge-badge-bloqueada'
            ]"
          >
            <v-avatar
              :color="possuiMedalha(c.marco) ? 'warning' : 'surface-variant'"
              size="40"
              class="mb-2"
            >
              <v-icon
                :icon="c.icone"
                :color="possuiMedalha(c.marco) ? 'white' : 'medium-emphasis'"
              />
            </v-avatar>
            <div class="text-subtitle-2 font-weight-bold">{{ c.titulo }}</div>
            <div class="text-caption font-weight-medium text-primary">{{ c.marco }} XP</div>
            <v-chip
              size="x-small"
              :color="possuiMedalha(c.marco) ? 'success' : 'surface-variant'"
              variant="flat"
              class="mt-1"
            >
              {{ possuiMedalha(c.marco) ? 'Conquistada' : 'Bloqueada' }}
            </v-chip>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-progress-linear v-if="carregando" color="primary" indeterminate rounded class="mb-4" />
    <v-alert v-if="erro" type="error" variant="tonal" class="mb-4">{{ erro }}</v-alert>

    <!-- Tabela / Lista do Ranking -->
    <v-card elevation="0" class="rounded-xl">
      <v-card-item class="border-b py-3 px-4">
        <div class="d-flex align-center justify-space-between">
          <span class="font-weight-bold text-subtitle-1">Classificacao Geral</span>
          <span class="text-caption text-medium-emphasis">{{ ranking.length }} competidores</span>
        </div>
      </v-card-item>

      <v-list density="comfortable" class="pa-2">
        <v-list-item
          v-for="item in ranking"
          :key="item.alunoId"
          :data-testid="`ranking-linha-${item.alunoId}`"
          :class="['rounded-lg mb-1 pa-3', { 'ranking-eu': souEu(item.alunoId) }]"
        >
          <template #prepend>
            <v-avatar
              :color="CORES_DO_PODIO[item.posicao] ?? 'surface-variant'"
              size="38"
              class="mr-3 font-weight-black text-body-1"
            >
              <v-icon v-if="item.posicao === 1" icon="mdi-trophy" color="white" size="20" />
              <v-icon v-else-if="item.posicao === 2 || item.posicao === 3" icon="mdi-medal" color="white" size="20" />
              <span v-else class="text-body-2">{{ item.posicao }}</span>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold text-body-1">
            {{ item.posicao }}. {{ item.nomeAluno }}
            <v-chip
              v-if="souEu(item.alunoId)"
              size="x-small"
              color="primary"
              variant="flat"
              class="ml-2 font-weight-bold"
            >
              voce
            </v-chip>
          </v-list-item-title>

          <template #append>
            <v-chip
              color="primary"
              variant="tonal"
              size="default"
              class="font-weight-bold px-3"
              prepend-icon="mdi-lightning-bolt"
            >
              {{ item.xpTotal }} XP
            </v-chip>
          </template>
        </v-list-item>

        <v-list-item v-if="!carregando && !erro && ranking.length === 0" class="pa-4 text-center">
          <span class="text-medium-emphasis">Ninguem pontuou neste curso ainda.</span>
        </v-list-item>
      </v-list>
    </v-card>
  </section>
</template>

<style scoped>
.ranking-eu {
  background-color: rgba(var(--v-theme-primary), 0.12) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
}

.ge-conquistas-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 0.6) 100%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.ge-badge-card {
  transition: transform 0.2s ease;
}

.ge-badge-card:hover {
  transform: translateY(-2px);
}

.ge-badge-desbloqueada {
  border-color: rgba(var(--v-theme-warning), 0.5);
  background: rgba(var(--v-theme-warning), 0.04);
}

.ge-badge-bloqueada {
  opacity: 0.6;
}
</style>
