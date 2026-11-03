<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMissoes } from '../composables/useMissoes.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'
import EstadoVazio from '../components/EstadoVazio.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const router = useRouter()
const {
  missoes,
  xpTotal,
  resultados,
  medalhasRecemConquistadas,
  tentativasPorDesafio,
  carregandoTentativas,
  carregando,
  erro,
  carregar,
  carregarTentativas,
  responder,
} = useMissoes(props.cursoId)

const historicoAberto = ref({})

function alternarHistorico(desafioId) {
  historicoAberto.value[desafioId] = !historicoAberto.value[desafioId]
  if (historicoAberto.value[desafioId] && !tentativasPorDesafio.value[desafioId]) {
    carregarTentativas(desafioId)
  }
}

// Proximo marco de medalha (50, 100, 250, 500)
const proximoMarco = computed(() => {
  const marcos = [50, 100, 250, 500]
  for (const m of marcos) {
    if (xpTotal.value < m) return m
  }
  return 500
})

const progressoPercentual = computed(() => {
  return Math.min(100, Math.round((xpTotal.value / proximoMarco.value) * 100))
})

function irParaAssistente() {
  router.push('/assistente')
}

onMounted(carregar)
</script>

<template>
  <section class="ge-missoes-page">
    <CabecalhoPagina
      titulo="Missoes do aluno"
      subtitulo="Resolva os desafios gamificados, acumule XP e desbloqueie novas medalhas"
      icone="mdi-sword-cross"
    >
      <template #acao>
        <v-btn
          color="accent"
          variant="tonal"
          prepend-icon="mdi-robot-outline"
          class="mr-2"
          @click="irParaAssistente"
        >
          Duvidas com IA
        </v-btn>
      </template>
    </CabecalhoPagina>

    <!-- Hero Card Gamificado 2026 -->
    <v-card class="pa-5 mb-6 ge-hero-card" elevation="0">
      <v-row align="center">
        <v-col cols="12" md="7">
          <div class="d-flex align-center ga-3 mb-2">
            <v-avatar color="primary" size="48" rounded="xl">
              <v-icon icon="mdi-trophy-variant" color="white" size="26" />
            </v-avatar>
            <div>
              <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
                Jornada Gamificada
              </span>
              <h2 class="text-h5 font-weight-bold">Status do Jogador</h2>
            </div>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-3">
            Conclua desafios para ganhar mais pontos de experiencia e subir no ranking da turma.
          </p>

          <div class="ge-progresso-container">
            <div class="d-flex justify-space-between text-caption font-weight-medium mb-1">
              <span>Rumo a medalha de {{ proximoMarco }} XP</span>
              <span>{{ xpTotal }} / {{ proximoMarco }} XP</span>
            </div>
            <v-progress-linear
              :model-value="progressoPercentual"
              color="primary"
              height="10"
              rounded
              bg-color="surface-variant"
            />
          </div>
        </v-col>

        <v-col cols="12" md="5" class="d-flex justify-md-end justify-start">
          <v-card variant="outlined" class="pa-4 bg-surface text-center ge-xp-badge" rounded="xl">
            <span class="text-caption text-uppercase font-weight-bold text-medium-emphasis d-block mb-1">
              XP Total no Curso
            </span>
            <div class="d-flex align-center justify-center ga-1">
              <v-icon icon="mdi-lightning-bolt" color="warning" size="32" />
              <strong data-testid="xp-total" class="text-h3 font-weight-black text-primary">
                {{ xpTotal }}
              </strong>
            </div>
            <span class="text-caption text-medium-emphasis">pontos acumulados</span>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Alertas de Novas Medalhas Conquistadas -->
    <div v-if="medalhasRecemConquistadas.length" class="d-flex flex-wrap ga-2 mb-6">
      <v-chip
        v-for="marco in medalhasRecemConquistadas"
        :key="marco"
        data-testid="nova-medalha"
        color="warning"
        variant="flat"
        size="large"
        class="font-weight-bold elevation-1"
        prepend-icon="mdi-medal"
      >
        Nova medalha: {{ marco }} XP
      </v-chip>
    </div>

    <v-progress-linear v-if="carregando" color="primary" indeterminate rounded class="mb-4" />
    <v-alert v-if="erro" type="error" class="mb-4">{{ erro }}</v-alert>

    <!-- Lista de Missoes -->
    <v-card
      v-for="missao in missoes"
      :key="missao.id"
      class="mb-6 ge-missao-card"
      elevation="0"
    >
      <v-card-item class="pb-3 pt-4 px-5">
        <template #prepend>
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-flag-checkered" color="white" />
          </v-avatar>
        </template>
        <v-card-title class="text-wrap text-h6 font-weight-bold">
          {{ missao.titulo }}
        </v-card-title>
        <v-card-subtitle class="text-wrap text-body-2 mt-1">
          {{ missao.descricao }}
        </v-card-subtitle>
        <template #append>
          <div class="d-flex ga-2 align-center">
            <v-chip color="primary" variant="tonal" size="default" class="font-weight-bold">
              <v-icon icon="mdi-lightning-bolt" start size="16" />
              {{ missao.xpTotal }} XP
            </v-chip>
            <v-chip size="small" variant="outlined" color="on-surface">
              {{ missao.desafios?.length ?? 0 }} desafios
            </v-chip>
          </div>
        </template>
      </v-card-item>

      <v-divider />

      <v-card-text class="px-5 py-2">
        <div
          v-for="(desafio, i) in missao.desafios"
          :key="desafio.id"
          :class="['py-4', i < missao.desafios.length - 1 ? 'ge-separador' : '']"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis">
              Desafio #{{ i + 1 }} · Valor: {{ desafio.xp }} XP
            </span>

            <!-- Botao para ver historico de tentativas (US01 / Desejavel) -->
            <v-btn
              size="x-small"
              variant="text"
              color="primary"
              prepend-icon="mdi-history"
              @click="alternarHistorico(desafio.id)"
            >
              {{ historicoAberto[desafio.id] ? 'Ocultar tentativas' : 'Ver tentativas' }}
            </v-btn>
          </div>

          <p class="text-body-1 font-weight-medium mb-3">{{ desafio.enunciado }}</p>

          <!-- Alternativas interativas -->
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="(alternativa, indice) in desafio.alternativas"
              :key="indice"
              :data-testid="`alternativa-${desafio.id}-${indice}`"
              variant="outlined"
              size="large"
              class="ge-alternativa-btn font-weight-regular"
              @click="responder(desafio.id, indice)"
            >
              <span class="ge-alternativa-letra mr-2">{{ String.fromCharCode(65 + indice) }}.</span>
              {{ alternativa }}
            </v-btn>
          </div>

          <!-- Feedback do resultado -->
          <v-alert
            v-if="resultados[desafio.id]"
            :type="resultados[desafio.id].correta ? 'success' : 'error'"
            density="compact"
            class="mt-4 rounded-lg font-weight-medium"
          >
            <v-icon
              :icon="resultados[desafio.id].correta ? 'mdi-check-circle' : 'mdi-close-circle'"
              start
            />
            {{ resultados[desafio.id].correta ? 'Resposta correta' : 'Resposta incorreta' }}
            (+{{ resultados[desafio.id].xpGanho }} XP)
          </v-alert>

          <!-- Historico de Tentativas do Desafio -->
          <div v-if="historicoAberto[desafio.id]" class="mt-4 pa-3 bg-surface-variant rounded-lg border">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-bold">
                <v-icon icon="mdi-history" size="16" class="mr-1" />
                Suas Tentativas Anteriores
              </span>
              <v-progress-circular
                v-if="carregandoTentativas[desafio.id]"
                indeterminate
                size="16"
                width="2"
                color="primary"
              />
            </div>

            <div v-if="tentativasPorDesafio[desafio.id] && tentativasPorDesafio[desafio.id].length" class="d-flex flex-column ga-2">
              <div
                v-for="t in tentativasPorDesafio[desafio.id]"
                :key="t.id"
                class="d-flex align-center justify-space-between pa-2 bg-surface rounded text-caption border"
              >
                <div class="d-flex align-center ga-2">
                  <v-icon
                    :icon="t.correta ? 'mdi-check-circle' : 'mdi-close-circle'"
                    :color="t.correta ? 'success' : 'error'"
                    size="16"
                  />
                  <span>Opcao escolhida: {{ String.fromCharCode(65 + t.indiceResposta) }}</span>
                </div>
                <div class="d-flex align-center ga-2">
                  <v-chip size="x-small" :color="t.correta ? 'success' : 'surface-variant'">
                    +{{ t.xpGanho }} XP
                  </v-chip>
                  <span class="text-medium-emphasis">
                    {{ new Date(t.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else-if="!carregandoTentativas[desafio.id]" class="text-caption text-medium-emphasis">
              Nenhuma tentativa registrada para este desafio ate o momento.
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="!carregando && !erro && missoes.length === 0" elevation="0">
      <EstadoVazio icone="mdi-flag-outline" mensagem="Ainda nao ha missoes publicadas neste curso." />
    </v-card>
  </section>
</template>

<style scoped>
.ge-hero-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08) 0%, rgba(var(--v-theme-surface), 1) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  border-radius: 20px;
}

.ge-xp-badge {
  min-width: 180px;
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.08);
}

.ge-missao-card {
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ge-missao-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
}

.ge-alternativa-btn {
  text-transform: none;
  min-height: 44px;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.ge-alternativa-btn:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.ge-alternativa-letra {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.ge-separador {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
