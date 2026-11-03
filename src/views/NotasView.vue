<script setup>
import { computed, onMounted } from 'vue'
import { useNotas } from '../composables/useNotas.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'
import EstadoVazio from '../components/EstadoVazio.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { notas, carregando, erro, carregar } = useNotas(props.cursoId)

const media = computed(() => {
  if (notas.value.length === 0) return null
  const soma = notas.value.reduce((total, nota) => total + Number(nota.valor), 0)
  return (soma / notas.value.length).toFixed(1)
})

/** Verde a partir de 6.0 (aprovado), vermelho abaixo disso. */
function cor(valor) {
  return Number(valor) >= 6 ? 'success' : 'error'
}

function statusAprovacao(valor) {
  return Number(valor) >= 6 ? 'Aprovado' : 'Em Recuperacao'
}

onMounted(carregar)
</script>

<template>
  <section class="ge-notas-page">
    <CabecalhoPagina
      titulo="Minhas notas"
      subtitulo="Acompanhe suas avaliacoes formais, notas lancadas e desempenho academico"
      icone="mdi-clipboard-text"
    >
      <template #acao>
        <v-chip
          v-if="media"
          :color="Number(media) >= 6 ? 'success' : 'warning'"
          variant="flat"
          size="large"
          prepend-icon="mdi-calculator"
          class="font-weight-bold"
        >
          Media Geral: {{ media }}
        </v-chip>
      </template>
    </CabecalhoPagina>

    <!-- Resumo de Desempenho Academico -->
    <v-card v-if="notas.length" class="mb-6 pa-5 ge-resumo-card" elevation="0">
      <v-row align="center">
        <v-col cols="12" sm="8">
          <div class="d-flex align-center ga-3 mb-1">
            <v-avatar :color="Number(media) >= 6 ? 'success' : 'warning'" size="44" rounded="lg">
              <v-icon :icon="Number(media) >= 6 ? 'mdi-school' : 'mdi-alert-circle'" color="white" />
            </v-avatar>
            <div>
              <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
                Situacao no Curso
              </span>
              <h3 class="text-h6 font-weight-bold">
                {{ Number(media) >= 6 ? 'Rendimento Adequado' : 'Abaixo da Media de Aprovacao' }}
              </h3>
            </div>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            {{ notas.length }} avaliacao(oes) computada(s). A media minima para aprovacao e 6.0.
          </p>
        </v-col>

        <v-col cols="12" sm="4" class="text-sm-right">
          <v-chip
            :color="Number(media) >= 6 ? 'success' : 'error'"
            variant="tonal"
            size="large"
            class="font-weight-bold text-h6 px-4"
          >
            {{ media }} / 10.0
          </v-chip>
        </v-col>
      </v-row>
    </v-card>

    <v-progress-linear v-if="carregando" color="primary" indeterminate rounded class="mb-4" />
    <v-alert v-if="erro" type="error" class="mb-4">{{ erro }}</v-alert>

    <v-card elevation="0" class="rounded-xl">
      <v-card-item class="border-b py-3 px-4">
        <span class="font-weight-bold text-subtitle-1">Boletim de Avaliacoes</span>
      </v-card-item>

      <v-list v-if="notas.length" density="comfortable" class="py-2">
        <template v-for="(nota, i) in notas" :key="nota.id">
          <v-divider v-if="i > 0" />
          <v-list-item class="py-3 px-4">
            <template #prepend>
              <v-avatar color="surface-variant" rounded="lg" size="40" class="mr-3">
                <v-icon icon="mdi-clipboard-check-outline" color="primary" />
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold text-body-1">
              {{ nota.avaliacao }}: {{ nota.valor }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-medium-emphasis mt-1">
              Avaliacao lancada pelo professor do curso
            </v-list-item-subtitle>
            <template #append>
              <div class="d-flex align-center ga-2">
                <v-chip :color="cor(nota.valor)" variant="tonal" size="small" class="font-weight-bold">
                  {{ statusAprovacao(nota.valor) }}
                </v-chip>
                <v-chip :color="cor(nota.valor)" variant="flat" size="default" class="font-weight-black">
                  {{ nota.valor }}
                </v-chip>
              </div>
            </template>
          </v-list-item>
        </template>
      </v-list>

      <EstadoVazio
        v-else-if="!carregando && !erro"
        icone="mdi-clipboard-outline"
        mensagem="Nenhuma avaliacao lancada ate agora."
      />
    </v-card>
  </section>
</template>

<style scoped>
.ge-resumo-card {
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 0.5) 100%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
