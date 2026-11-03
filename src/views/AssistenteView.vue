<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIa } from '../composables/useIa.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const router = useRouter ? useRouter() : null
const {
  recomendacoes,
  carregandoRecomendacoes,
  carregarRecomendacoes,
  mensagens,
  carregandoResposta,
  enviarPergunta,
} = useIa(props.cursoId)

const textoPergunta = ref('')

const SUGESTOES = [
  'Como calcular a soma de fracoes?',
  'Quais desafios dao mais XP?',
  'Como funcionam as medalhas de conquista?',
  'Dicas para a missao recomendada',
]

function enviar(sugestao) {
  const pergunta = sugestao ?? textoPergunta.value
  if (!pergunta || !pergunta.trim() || carregandoResposta.value) return
  enviarPergunta(pergunta)
  textoPergunta.value = ''
}

function abrirMissao() {
  if (router) router.push('/missoes')
}

onMounted(() => {
  carregarRecomendacoes()
})
</script>

<template>
  <section class="ge-ia-page">
    <CabecalhoPagina
      titulo="Assistente Educacional com IA"
      subtitulo="Tire duvidas sobre o material do curso e receba recomendacoes personalizadas"
      icone="mdi-robot-outline"
    >
      <template #acao>
        <span class="win-sunken-panel">
          IA: {{ recomendacoes.origem === 'ia' ? 'ONLINE (RAG)' : 'FALLBACK' }}
        </span>
      </template>
    </CabecalhoPagina>

    <!-- Recomendacoes de Missoes (Destaque do Sistema) -->
    <fieldset class="win-groupbox mb-3">
      <legend class="ge-legenda">Missoes Recomendadas para o seu Perfil</legend>
      <div v-if="recomendacoes.itens && recomendacoes.itens.length" class="ge-recs">
        <div
          v-for="item in recomendacoes.itens"
          :key="item.missaoId"
          class="ge-rec-item win-raised"
          @click="abrirMissao"
        >
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="ge-mono">&#9658; MISSAO #{{ item.missaoId }}</span>
            <span class="win-sunken-panel">Relevancia: {{ Math.round(item.pontuacao * 100) }}%</span>
          </div>
          <strong class="d-block ge-rec-titulo">{{ item.titulo }}</strong>
          <span class="ge-dica">{{ item.motivo }}</span>
        </div>
      </div>
      <div v-else class="win-sunken pa-2 ge-mono font-size-11">
        Nenhuma recomendacao gerada no momento.
      </div>
    </fieldset>

    <!-- Terminal de Interacao com o Assistente (ASSIST.COM) -->
    <fieldset class="win-groupbox">
      <legend class="ge-legenda">Console de Consulta &mdash; ASSIST.COM</legend>

      <!-- Terminal Screen (Sunken CRT/Console) -->
      <div class="ge-terminal-tela win-sunken">
        <div class="ge-terminal-header">
          Microsoft(R) GameEducator IA Diagnostic Interface v1.0<br />
          (C) Copyright 1995 B1 Corp. Provedor: {{ recomendacoes.origem || 'sistema' }}<br />
          Digite sua duvida ou clique em uma das macros sugeridas.
        </div>

        <div v-if="mensagens.length === 0" class="ge-terminal-prompt-inicial">
          C:\IA&gt; _
        </div>

        <!-- Mensagens do historico -->
        <div v-for="(msg, idx) in mensagens" :key="idx" class="ge-mensagem-bloco">
          <div v-if="msg.tipo === 'usuario'" class="ge-msg-usr">
            C:\IA&gt; {{ msg.conteudo }}
          </div>
          <div v-else class="ge-msg-ia">
            <div class="ge-ia-resposta">{{ msg.conteudo }}</div>
            <div v-if="msg.fontes && msg.fontes.length" class="ge-ia-fontes">
              [Fontes citadas no banco de conhecimento]:
              <span v-for="f in msg.fontes" :key="f.id" class="ge-ia-fonte-tag">
                &middot; {{ f.titulo }} (rel: {{ Math.round(f.relevancia * 100) }}%)
              </span>
            </div>
          </div>
        </div>

        <div v-if="carregandoResposta" class="ge-terminal-carregando">
          C:\IA&gt; CONSULTANDO BASE RAG... [|||||]
        </div>
      </div>

      <!-- Macros / Sugestoes rapidas -->
      <div class="ge-macros mt-2">
        <span class="ge-macros-rotulo">Macros:</span>
        <button
          v-for="(sug, sIdx) in SUGESTOES"
          :key="sIdx"
          class="win-btn ge-macro-btn"
          @click="enviar(sug)"
        >
          {{ sug }}
        </button>
      </div>

      <!-- Formulario de envio com submit.prevent -->
      <form class="ge-form-prompt mt-2" @submit.prevent="enviar()">
        <span class="ge-prompt-label">C:\IA&gt;</span>
        <input
          v-model="textoPergunta"
          type="text"
          class="win-sunken ge-prompt-input"
          placeholder="Escreva sua pergunta para a IA e pressione Enter..."
          :disabled="carregandoResposta"
        />
        <button
          type="submit"
          class="win-btn win-btn-default font-weight-bold"
          :disabled="carregandoResposta || !textoPergunta.trim()"
        >
          Enviar
        </button>
      </form>
    </fieldset>
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

.ge-dica {
  font-size: 10px;
}

.ge-recs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 6px;
}

.ge-rec-item {
  padding: 6px 8px;
  cursor: pointer;
}

.ge-rec-titulo {
  font-size: 12px;
}

.ge-terminal-tela {
  background: #000000 !important;
  color: #00ff66 !important;
  font-family: var(--win-font-mono) !important;
  font-size: 11px !important;
  min-height: 240px;
  max-height: 420px;
  overflow-y: auto;
  padding: 8px 10px;
  line-height: 1.4;
  border-top: 2px solid var(--win-gray-dark);
  border-left: 2px solid var(--win-gray-dark);
  border-right: 2px solid var(--win-white);
  border-bottom: 2px solid var(--win-white);
}

.ge-terminal-header {
  color: #88ff88;
  margin-bottom: 8px;
  border-bottom: 1px dashed #008833;
  padding-bottom: 4px;
}

.ge-msg-usr {
  color: #ffffff;
  font-weight: bold;
  margin-top: 6px;
}

.ge-msg-ia {
  color: #00ff66;
  margin-top: 4px;
  padding-left: 10px;
}

.ge-ia-resposta {
  white-space: pre-wrap;
}

.ge-ia-fontes {
  margin-top: 4px;
  color: #ffff66;
  font-size: 10px;
}

.ge-ia-fonte-tag {
  display: block;
  margin-left: 10px;
}

.ge-terminal-carregando {
  color: #ffff00;
  margin-top: 6px;
  animation: piscar 0.8s infinite;
}

@keyframes piscar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.ge-macros {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.ge-macros-rotulo {
  font-size: 11px;
  font-weight: bold;
}

.ge-macro-btn {
  font-size: 10px !important;
  font-weight: normal !important;
  padding: 1px 6px !important;
}

.ge-form-prompt {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ge-prompt-label {
  font-family: var(--win-font-mono);
  font-weight: bold;
  font-size: 12px;
}

.ge-prompt-input {
  flex: 1;
  padding: 3px 6px;
  font-family: var(--win-font-mono);
  font-size: 12px;
  outline: none;
}
</style>
