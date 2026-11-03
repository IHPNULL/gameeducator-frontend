<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDesempenhoTurma } from '../composables/useDesempenhoTurma.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'
import EstadoVazio from '../components/EstadoVazio.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { desempenho, carregando, salvandoNota, erro, sucessoNota, carregar, registrarNota } =
  useDesempenhoTurma(props.cursoId)

const modalNotaAberto = ref(false)
const alunoSelecionado = ref(null)
const avaliacaoNome = ref('Prova 1')
const notaValor = ref('8.5')

const xpDaTurma = computed(() => desempenho.value.reduce((total, a) => total + a.xpTotal, 0))

const mediaAcertoTurma = computed(() => {
  if (!desempenho.value.length) return 0
  const soma = desempenho.value.reduce((total, a) => total + a.taxaAcerto, 0)
  return Math.round((soma / desempenho.value.length) * 100)
})

const alunosEmAtencao = computed(() => {
  return desempenho.value.filter((a) => a.taxaAcerto < 0.5).length
})

function cor(taxa) {
  if (taxa >= 0.75) return 'success'
  return taxa >= 0.5 ? 'warning' : 'error'
}

function abrirModalNota(aluno) {
  alunoSelecionado.value = aluno
  modalNotaAberto.value = true
}

async function confirmarLancamentoNota() {
  if (!alunoSelecionado.value || !avaliacaoNome.value || !notaValor.value) return
  const sucesso = await registrarNota(
    alunoSelecionado.value.alunoId,
    avaliacaoNome.value,
    Number(notaValor.value),
  )
  if (sucesso) {
    modalNotaAberto.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <section class="ge-painel-page">
    <CabecalhoPagina
      titulo="Desempenho da turma"
      subtitulo="Acompanhe quem esta avancando, identifique alunos com dificuldades e lance notas avaliativas"
      icone="mdi-chart-box"
    >
      <template #acao>
        <v-chip color="primary" variant="flat" size="large" prepend-icon="mdi-account-group">
          {{ desempenho.length }} alunos · {{ xpDaTurma }} XP
        </v-chip>
      </template>
    </CabecalhoPagina>

    <!-- Cards KPI do Painel -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card class="pa-4 ge-kpi-card" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-caption text-medium-emphasis">Total de Alunos</span>
              <h3 class="text-h4 font-weight-bold mt-1">{{ desempenho.length }}</h3>
            </div>
            <v-avatar color="primary" rounded="lg" size="44">
              <v-icon icon="mdi-account-multiple" color="white" />
            </v-avatar>
          </div>
          <span class="text-caption text-medium-emphasis mt-2 d-block">
            Matriculados no curso atual
          </span>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="pa-4 ge-kpi-card" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-caption text-medium-emphasis">Media de Acertos da Turma</span>
              <h3 class="text-h4 font-weight-bold mt-1">{{ mediaAcertoTurma }}%</h3>
            </div>
            <v-avatar color="info" rounded="lg" size="44">
              <v-icon icon="mdi-bullseye-arrow" color="white" />
            </v-avatar>
          </div>
          <span class="text-caption text-medium-emphasis mt-2 d-block">
            Baseado em todas as tentativas
          </span>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="pa-4 ge-kpi-card" elevation="0">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-caption text-medium-emphasis">Alunos em Atencao</span>
              <h3 class="text-h4 font-weight-bold mt-1" :class="alunosEmAtencao > 0 ? 'text-error' : 'text-success'">
                {{ alunosEmAtencao }}
              </h3>
            </div>
            <v-avatar :color="alunosEmAtencao > 0 ? 'error' : 'success'" rounded="lg" size="44">
              <v-icon :icon="alunosEmAtencao > 0 ? 'mdi-alert-circle-outline' : 'mdi-check-all'" color="white" />
            </v-avatar>
          </div>
          <span class="text-caption text-medium-emphasis mt-2 d-block">
            Taxa de acerto abaixo de 50%
          </span>
        </v-card>
      </v-col>
    </v-row>

    <v-progress-linear v-if="carregando" color="primary" indeterminate rounded class="mb-4" />
    <v-alert v-if="erro" type="error" class="mb-4">{{ erro }}</v-alert>
    <v-alert v-if="sucessoNota" type="success" closable class="mb-4">{{ sucessoNota }}</v-alert>

    <v-card elevation="0" class="rounded-xl">
      <v-card-item class="border-b py-3 px-4">
        <div class="d-flex align-center justify-space-between">
          <span class="font-weight-bold text-subtitle-1">Quadro de Acompanhamento Individual</span>
          <span class="text-caption text-medium-emphasis">Acoes rapidas do professor</span>
        </div>
      </v-card-item>

      <v-table v-if="desempenho.length" class="ge-tabela">
        <thead>
          <tr>
            <th>Aluno</th>
            <th class="text-right">XP</th>
            <th class="text-right">Tentativas</th>
            <th class="text-right">Acertos</th>
            <th class="text-right">Taxa de acerto</th>
            <th class="text-center">Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="aluno in desempenho" :key="aluno.alunoId">
            <td>
              <div class="d-flex align-center ga-3 py-1">
                <v-avatar color="primary" size="34" class="text-white font-weight-bold">
                  {{ aluno.nome.charAt(0) }}
                </v-avatar>
                <div>
                  <span class="font-weight-medium d-block">{{ aluno.nome }}</span>
                  <span class="text-caption text-medium-emphasis">ID #{{ aluno.alunoId }}</span>
                </div>
              </div>
            </td>
            <td class="text-right font-weight-bold">{{ aluno.xpTotal }}</td>
            <td class="text-right">{{ aluno.tentativas }}</td>
            <td class="text-right">{{ aluno.acertos }}</td>
            <td class="text-right">
              <v-chip :color="cor(aluno.taxaAcerto)" variant="tonal" size="small" class="font-weight-bold">
                {{ Math.round(aluno.taxaAcerto * 100) }}%
              </v-chip>
            </td>
            <td class="text-center">
              <v-btn
                size="small"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-clipboard-edit-outline"
                @click="abrirModalNota(aluno)"
              >
                Lancar Nota
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <EstadoVazio
        v-else-if="!carregando && !erro"
        icone="mdi-account-group-outline"
        mensagem="Nenhum aluno matriculado neste curso ainda."
      />
    </v-card>

    <!-- Dialog Modal para Lancar Nota (US02 / NotaController) -->
    <v-dialog v-model="modalNotaAberto" max-width="480">
      <v-card class="pa-4 rounded-xl">
        <v-card-item class="pb-1">
          <v-card-title class="font-weight-bold text-h6">
            Lancar Avaliacao
          </v-card-title>
          <v-card-subtitle v-if="alunoSelecionado">
            Aluno: <strong>{{ alunoSelecionado.nome }}</strong> (ID: {{ alunoSelecionado.alunoId }})
          </v-card-subtitle>
        </v-card-item>

        <v-card-text class="pt-3">
          <v-text-field
            v-model="avaliacaoNome"
            label="Descricao da Avaliacao"
            placeholder="Ex: Prova 1, Projeto Pratico, Trabalho Semestral"
            class="mb-3"
          />
          <v-text-field
            v-model="notaValor"
            label="Nota (0.0 a 10.0)"
            type="number"
            step="0.1"
            min="0"
            max="10"
          />
        </v-card-text>

        <v-card-actions class="px-4 pb-2">
          <v-spacer />
          <v-btn variant="text" @click="modalNotaAberto = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="salvandoNota"
            prepend-icon="mdi-check"
            @click="confirmarLancamentoNota"
          >
            Salvar Nota
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<style scoped>
.ge-kpi-card {
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 0.5) 100%);
}

.ge-tabela :deep(thead th) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.ge-tabela :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
