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
        <button class="win-btn" @click="irParaAssistente">
          <v-icon icon="mdi-robot-outline" size="14" class="mr-1" />Duvidas com IA...
        </button>
      </template>
    </CabecalhoPagina>

    <!-- Status do jogador -->
    <div class="ge-status">
      <fieldset class="win-groupbox ge-status__progresso">
        <legend class="ge-legenda">Status do Jogador</legend>
        <div class="ge-linha-info">
          <span>Rumo a medalha de {{ proximoMarco }} XP</span>
          <span class="ge-mono">{{ xpTotal }} / {{ proximoMarco }} XP ({{ progressoPercentual }}%)</span>
        </div>
        <div class="win-progress-trough">
          <div class="win-progress-blocks" :style="{ width: `${progressoPercentual}%` }" />
        </div>
        <p class="ge-dica">Conclua desafios para ganhar XP e subir no ranking da turma.</p>
      </fieldset>

      <fieldset class="win-groupbox ge-status__xp">
        <legend class="ge-legenda">XP Total no Curso</legend>
        <div class="ge-lcd">
          <strong data-testid="xp-total">{{ xpTotal }}</strong>
        </div>
        <span class="ge-dica">pontos acumulados</span>
      </fieldset>
    </div>

    <!-- Novas medalhas -->
    <div v-if="medalhasRecemConquistadas.length" class="ge-medalhas">
      <div
        v-for="marco in medalhasRecemConquistadas"
        :key="marco"
        data-testid="nova-medalha"
        class="ge-aviso ge-aviso--medalha win-raised"
      >
        <span class="ge-aviso__icone">&#9733;</span>
        Nova medalha: {{ marco }} XP
      </div>
    </div>

    <div v-if="carregando" class="ge-carregando win-sunken-panel">Carregando missoes do servidor...</div>
    <div v-if="erro" class="ge-aviso ge-aviso--erro win-raised">
      <span class="ge-aviso__icone">&#10006;</span>{{ erro }}
    </div>

    <!-- Lista de missoes -->
    <div v-for="missao in missoes" :key="missao.id" class="ge-missao win-raised">
      <div class="ge-missao__barra">
        <span>&#9873; {{ missao.titulo }}</span>
        <span class="ge-mono">{{ missao.xpTotal }} XP &middot; {{ missao.desafios?.length ?? 0 }} desafios</span>
      </div>
      <p class="ge-missao__desc">{{ missao.descricao }}</p>

      <div class="ge-missao__desafios">
        <fieldset
          v-for="(desafio, i) in missao.desafios"
          :key="desafio.id"
          class="win-groupbox ge-desafio"
        >
          <legend class="ge-legenda">Desafio #{{ i + 1 }} &middot; Valor: {{ desafio.xp }} XP</legend>

          <div class="d-flex justify-space-between align-start ga-2 mb-2">
            <p class="ge-enunciado">{{ desafio.enunciado }}</p>
            <button class="win-btn ge-btn-peq" @click="alternarHistorico(desafio.id)">
              {{ historicoAberto[desafio.id] ? 'Ocultar tentativas' : 'Ver tentativas' }}
            </button>
          </div>

          <div class="ge-alternativas">
            <button
              v-for="(alternativa, indice) in desafio.alternativas"
              :key="indice"
              :data-testid="`alternativa-${desafio.id}-${indice}`"
              class="win-btn ge-alternativa"
              @click="responder(desafio.id, indice)"
            >
              <u>{{ String.fromCharCode(65 + indice) }}</u>. {{ alternativa }}
            </button>
          </div>

          <div
            v-if="resultados[desafio.id]"
            :class="['ge-aviso', 'win-raised', resultados[desafio.id].correta ? 'ge-aviso--ok' : 'ge-aviso--erro']"
          >
            <span class="ge-aviso__icone">{{ resultados[desafio.id].correta ? '&#10004;' : '&#10006;' }}</span>
            {{ resultados[desafio.id].correta ? 'Resposta correta' : 'Resposta incorreta' }}
            (+{{ resultados[desafio.id].xpGanho }} XP)
          </div>

          <!-- Historico de tentativas -->
          <div v-if="historicoAberto[desafio.id]" class="mt-2">
            <div class="ge-linha-info mb-1">
              <strong>Suas Tentativas Anteriores</strong>
              <span v-if="carregandoTentativas[desafio.id]" class="ge-mono">lendo...</span>
            </div>
            <table v-if="tentativasPorDesafio[desafio.id] && tentativasPorDesafio[desafio.id].length" class="win-table">
              <thead>
                <tr>
                  <th>Resultado</th>
                  <th>Opcao escolhida</th>
                  <th>XP</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in tentativasPorDesafio[desafio.id]" :key="t.id">
                  <td :class="t.correta ? 'ge-ok' : 'ge-erro'">{{ t.correta ? 'ACERTO' : 'ERRO' }}</td>
                  <td>Opcao escolhida: {{ String.fromCharCode(65 + t.indiceResposta) }}</td>
                  <td class="ge-mono">+{{ t.xpGanho }} XP</td>
                  <td class="ge-mono">
                    {{ new Date(t.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else-if="!carregandoTentativas[desafio.id]" class="win-sunken ge-sem-tentativas">
              Nenhuma tentativa registrada para este desafio ate o momento.
            </div>
          </div>
        </fieldset>
      </div>
    </div>

    <EstadoVazio
      v-if="!carregando && !erro && missoes.length === 0"
      icone="mdi-flag-outline"
      mensagem="Ainda nao ha missoes publicadas neste curso."
    />
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
  font-size: 11px;
}

.ge-status {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 8px;
  margin-bottom: 4px;
}

.ge-linha-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 3px;
}

.ge-dica {
  font-size: 10px;
  margin: 4px 0 0;
}

.ge-status__xp {
  text-align: center;
}

.ge-lcd {
  background: #0a1a0a;
  color: #33ff33;
  font-family: var(--win-font-mono);
  font-size: 30px;
  line-height: 1.1;
  padding: 4px 8px;
  text-align: right;
  border-top: 2px solid var(--win-gray-dark);
  border-left: 2px solid var(--win-gray-dark);
  border-right: 2px solid var(--win-white);
  border-bottom: 2px solid var(--win-white);
  text-shadow: 0 0 4px #33ff33;
}

.ge-medalhas {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0;
}

.ge-aviso {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  margin-top: 6px;
  font-size: 11px;
  font-weight: bold;
}

.ge-aviso__icone {
  font-size: 14px;
}

.ge-aviso--ok .ge-aviso__icone { color: #008000; }
.ge-aviso--erro .ge-aviso__icone { color: #c00000; }
.ge-aviso--medalha .ge-aviso__icone { color: #b08000; }

.ge-carregando {
  margin: 6px 0;
}

.ge-missao {
  margin: 10px 0;
  padding: 2px;
}

.ge-missao__barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--win-gray-dark);
  color: #fff;
  font-weight: bold;
  font-size: 12px;
  padding: 3px 6px;
}

.ge-missao__desc {
  font-size: 11px;
  margin: 4px 6px;
}

.ge-missao__desafios {
  padding: 0 6px 4px;
}

.ge-enunciado {
  font-size: 13px;
  font-weight: bold;
  margin: 0;
}

.ge-btn-peq {
  font-size: 10px !important;
  font-weight: normal !important;
  white-space: nowrap;
}

.ge-alternativas {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.ge-alternativa {
  font-weight: normal !important;
  min-width: 90px;
  text-align: left;
}

.ge-ok { color: #008000; font-weight: bold; }
.ge-erro { color: #c00000; font-weight: bold; }

.ge-sem-tentativas {
  padding: 6px;
  font-size: 11px;
}
</style>
