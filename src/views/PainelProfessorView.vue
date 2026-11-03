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
        <span class="win-sunken-panel">{{ desempenho.length }} alunos &middot; {{ xpDaTurma }} XP</span>
      </template>
    </CabecalhoPagina>

    <!-- Instrumentos (KPIs) -->
    <div class="ge-kpis">
      <fieldset class="win-groupbox ge-kpi">
        <legend class="ge-legenda">Total de Alunos</legend>
        <div class="ge-lcd">{{ desempenho.length }}</div>
        <span class="ge-nota">Matriculados no curso atual</span>
      </fieldset>
      <fieldset class="win-groupbox ge-kpi">
        <legend class="ge-legenda">Media de Acertos da Turma</legend>
        <div class="ge-lcd">{{ mediaAcertoTurma }}%</div>
        <span class="ge-nota">Baseado em todas as tentativas</span>
      </fieldset>
      <fieldset class="win-groupbox ge-kpi">
        <legend class="ge-legenda">Alunos em Atencao</legend>
        <div :class="['ge-lcd', { 'ge-lcd--alerta': alunosEmAtencao > 0 }]">{{ alunosEmAtencao }}</div>
        <span class="ge-nota">
          <span :class="['ge-led', alunosEmAtencao > 0 ? 'ge-led--vermelho' : 'ge-led--verde']" />
          Taxa de acerto abaixo de 50%
        </span>
      </fieldset>
    </div>

    <div v-if="carregando" class="win-sunken-panel my-2">Calculando desempenho...</div>
    <div v-if="erro" class="ge-aviso win-raised">&#10006; {{ erro }}</div>
    <div v-if="sucessoNota" class="ge-aviso win-raised">&#10004; {{ sucessoNota }}</div>

    <fieldset class="win-groupbox">
      <legend class="ge-legenda">Quadro de Acompanhamento Individual</legend>
      <table v-if="desempenho.length" class="win-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Aluno</th>
            <th class="ge-dir">XP</th>
            <th class="ge-dir">Tentativas</th>
            <th class="ge-dir">Acertos</th>
            <th class="ge-dir">Taxa de acerto</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="aluno in desempenho" :key="aluno.alunoId">
            <td class="ge-mono">#{{ aluno.alunoId }}</td>
            <td>{{ aluno.nome }}</td>
            <td class="ge-dir ge-mono"><strong>{{ aluno.xpTotal }}</strong></td>
            <td class="ge-dir ge-mono">{{ aluno.tentativas }}</td>
            <td class="ge-dir ge-mono">{{ aluno.acertos }}</td>
            <td class="ge-dir ge-mono">
              <span :class="['ge-led', `ge-led--${cor(aluno.taxaAcerto)}`]" />
              {{ Math.round(aluno.taxaAcerto * 100) }}%
            </td>
            <td>
              <v-btn size="small" @click="abrirModalNota(aluno)">Lancar Nota</v-btn>
            </td>
          </tr>
        </tbody>
      </table>

      <EstadoVazio
        v-else-if="!carregando && !erro"
        icone="mdi-account-group-outline"
        mensagem="Nenhum aluno matriculado neste curso ainda."
      />
    </fieldset>

    <!-- Caixa de dialogo para Lancar Nota (US02 / NotaController) -->
    <div v-if="modalNotaAberto" class="ge-modal-fundo">
      <div class="ge-dialogo win-raised" role="dialog" aria-modal="true">
        <div class="win-titlebar">
          <span class="win-titlebar-text">Lancar Avaliacao</span>
          <button class="win-control-btn" aria-label="Fechar" @click="modalNotaAberto = false">&#10005;</button>
        </div>
        <div class="ge-dialogo-corpo">
          <p v-if="alunoSelecionado" class="mb-3">
            Aluno: <strong>{{ alunoSelecionado.nome }}</strong> (ID: {{ alunoSelecionado.alunoId }})
          </p>
          <label class="ge-campo">
            <span><u>D</u>escricao da Avaliacao:</span>
            <input
              v-model="avaliacaoNome"
              class="win-sunken"
              placeholder="Ex: Prova 1, Projeto Pratico, Trabalho Semestral"
            />
          </label>
          <label class="ge-campo">
            <span><u>N</u>ota (0.0 a 10.0):</span>
            <input v-model="notaValor" class="win-sunken ge-curto" type="number" step="0.1" min="0" max="10" />
          </label>
        </div>
        <div class="ge-dialogo-acoes">
          <button class="win-btn win-btn-default" :disabled="salvandoNota" @click="confirmarLancamentoNota">
            {{ salvandoNota ? 'Aguarde...' : 'Salvar Nota' }}
          </button>
          <button class="win-btn" @click="modalNotaAberto = false">Cancelar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ge-legenda {
  font-weight: bold;
  font-size: 11px;
  padding: 0 3px;
}

.ge-mono {
  font-family: var(--win-font-mono);
}

.ge-dir {
  text-align: right !important;
}

.ge-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.ge-lcd {
  background: #0a1a0a;
  color: #33ff33;
  font-family: var(--win-font-mono);
  font-size: 24px;
  line-height: 1.1;
  padding: 3px 8px;
  text-align: right;
  border-top: 2px solid var(--win-gray-dark);
  border-left: 2px solid var(--win-gray-dark);
  border-right: 2px solid var(--win-white);
  border-bottom: 2px solid var(--win-white);
  text-shadow: 0 0 4px currentColor;
}

.ge-lcd--alerta {
  color: #ff5544;
}

.ge-nota {
  display: block;
  font-size: 10px;
  margin-top: 3px;
}

.ge-led {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid #000;
  margin-right: 3px;
  vertical-align: middle;
}

.ge-led--verde, .ge-led--success { background: #00d000; box-shadow: 0 0 3px #00ff00; }
.ge-led--warning { background: #e0c000; box-shadow: 0 0 3px #ffee00; }
.ge-led--vermelho, .ge-led--error { background: #e00000; box-shadow: 0 0 3px #ff0000; }

.ge-aviso {
  padding: 4px 8px;
  margin: 6px 0;
  font-weight: bold;
  font-size: 11px;
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
  width: 380px;
  padding: 2px;
}

.ge-dialogo-corpo {
  padding: 12px;
  font-size: 11px;
}

.ge-campo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.ge-campo input {
  padding: 3px 4px;
  font-size: 12px;
  outline: none;
}

.ge-curto {
  width: 90px;
}

.ge-dialogo-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  padding: 0 12px 10px;
}

.ge-dialogo-acoes .win-btn {
  min-width: 80px;
}
</style>
