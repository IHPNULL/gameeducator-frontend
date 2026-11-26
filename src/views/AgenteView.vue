<script setup>
import { onMounted, ref } from 'vue'
import { useAgente } from '../composables/useAgente.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { mensagens, agente, metas, pendentes, decididas, pensando, decidindo, erro, carregar, enviar, aprovar, rejeitar } =
  useAgente(props.cursoId)

const texto = ref('')

const MACROS = {
  orientacao: [
    'Como estou no curso?',
    'O que devo estudar agora?',
    'Crie uma meta para eu terminar a missao recomendada em 7 dias',
  ],
  acompanhamento: [
    'Como esta a turma?',
    'Quem esta com mais dificuldade?',
    'Proponha um lembrete para o aluno com menos XP',
  ],
}

const NOME_AGENTE = {
  orientacao: 'Agente de Orientacao (aluno)',
  acompanhamento: 'Agente de Acompanhamento (professor)',
}

function macros() {
  return MACROS[agente.value] ?? [...MACROS.orientacao.slice(0, 2), ...MACROS.acompanhamento.slice(0, 1)]
}

function enviarTexto(sugestao) {
  const mensagem = sugestao ?? texto.value
  if (!mensagem || !mensagem.trim() || pensando.value) return
  enviar(mensagem)
  texto.value = ''
}

function rotuloTipo(tipo) {
  return tipo === 'META_DE_ESTUDO' ? 'META DE ESTUDO' : 'LEMBRETE AO ALUNO'
}

onMounted(carregar)
</script>

<template>
  <section class="ge-agente-page">
    <CabecalhoPagina
      titulo="Agentes de IA"
      subtitulo="O agente consulta seus dados e propoe acoes; nada acontece sem a sua autorizacao"
      icone="mdi-robot-happy-outline"
    >
      <template #acao>
        <span class="win-sunken-panel" data-test="agente-ativo">
          {{ NOME_AGENTE[agente] ?? 'Agente: aguardando primeira mensagem' }}
        </span>
      </template>
    </CabecalhoPagina>

    <div class="ge-agente-grid">
      <fieldset class="win-groupbox">
        <legend class="ge-legenda">Conversa &mdash; AGENTE.EXE</legend>

        <div class="ge-chat win-sunken" data-test="chat">
          <div v-if="!mensagens.length" class="ge-chat-vazio">
            Pergunte algo ao agente. Ele usa ferramentas com os SEUS dados do curso e, quando sugerir uma acao,
            ela aparece em "Acoes aguardando autorizacao".
          </div>
          <div v-for="(msg, idx) in mensagens" :key="idx" :class="['ge-msg', `ge-msg-${msg.tipo}`]">
            <span class="ge-msg-hora">[{{ msg.dataHora }}]</span>
            <strong v-if="msg.tipo === 'usuario'">Voce:</strong>
            <strong v-else-if="msg.tipo === 'agente'">Agente:</strong>
            <strong v-else>Erro:</strong>
            <span class="ge-msg-texto">{{ msg.conteudo }}</span>
          </div>
          <div v-if="pensando" class="ge-msg ge-pensando">Agente consultando ferramentas...</div>
        </div>

        <div class="ge-macros mt-2">
          <span class="ge-macros-rotulo">Macros:</span>
          <button v-for="m in macros()" :key="m" class="win-btn ge-macro-btn" :disabled="pensando" @click="enviarTexto(m)">
            {{ m }}
          </button>
        </div>

        <form class="ge-form mt-2" @submit.prevent="enviarTexto()">
          <input
            v-model="texto"
            type="text"
            class="win-sunken ge-input"
            placeholder="Escreva para o agente e pressione Enter..."
            :disabled="pensando"
          />
          <button type="submit" class="win-btn win-btn-default font-weight-bold" :disabled="pensando || !texto.trim()">
            Enviar
          </button>
        </form>
      </fieldset>

      <div class="ge-coluna">
        <fieldset class="win-groupbox" data-test="pendentes">
          <legend class="ge-legenda">Acoes aguardando autorizacao ({{ pendentes.length }})</legend>
          <div v-if="!pendentes.length" class="ge-vazio">Nenhuma acao proposta pelo agente.</div>
          <div v-for="acao in pendentes" :key="acao.id" class="ge-acao win-raised" :data-test="`acao-${acao.id}`">
            <div class="ge-acao-tipo">#{{ acao.id }} &middot; {{ rotuloTipo(acao.tipo) }}</div>
            <div class="ge-acao-desc">{{ acao.descricao }}</div>
            <div class="ge-acao-botoes">
              <button class="win-btn win-btn-default" :disabled="decidindo === acao.id" @click="aprovar(acao)">
                Aprovar
              </button>
              <button class="win-btn" :disabled="decidindo === acao.id" @click="rejeitar(acao)">Rejeitar</button>
            </div>
          </div>
          <div v-if="erro" class="ge-erro">{{ erro }}</div>
        </fieldset>

        <fieldset v-if="metas.length" class="win-groupbox mt-2" data-test="metas">
          <legend class="ge-legenda">Minhas metas de estudo</legend>
          <div v-for="meta in metas" :key="meta.id" class="ge-meta">&#9658; {{ meta.descricao }}</div>
        </fieldset>

        <fieldset v-if="decididas.length" class="win-groupbox mt-2" data-test="historico">
          <legend class="ge-legenda">Historico de decisoes</legend>
          <div v-for="acao in decididas" :key="acao.id" class="ge-historico">
            #{{ acao.id }} {{ rotuloTipo(acao.tipo) }} &mdash; <strong>{{ acao.status }}</strong>
          </div>
        </fieldset>
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

.ge-agente-grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 8px;
}

@media (max-width: 900px) {
  .ge-agente-grid {
    grid-template-columns: 1fr;
  }
}

.ge-chat {
  min-height: 260px;
  max-height: 420px;
  overflow-y: auto;
  padding: 6px 8px;
  font-size: 12px;
  background: var(--win-white, #fff);
}

.ge-chat-vazio,
.ge-vazio {
  font-size: 11px;
  color: var(--win-gray-dark, #555);
}

.ge-msg {
  margin-bottom: 6px;
  line-height: 1.4;
}

.ge-msg-hora {
  font-family: var(--win-font-mono);
  font-size: 10px;
  margin-right: 4px;
}

.ge-msg-texto {
  white-space: pre-wrap;
  margin-left: 4px;
}

.ge-msg-agente {
  color: #00007b;
}

.ge-msg-erro,
.ge-erro {
  color: #a00000;
  font-size: 11px;
}

.ge-pensando {
  font-style: italic;
}

.ge-macros {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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

.ge-form {
  display: flex;
  gap: 6px;
}

.ge-input {
  flex: 1;
  padding: 3px 6px;
  font-size: 12px;
  outline: none;
}

.ge-acao {
  padding: 6px 8px;
  margin-bottom: 6px;
}

.ge-acao-tipo {
  font-family: var(--win-font-mono);
  font-size: 10px;
  font-weight: bold;
}

.ge-acao-desc {
  font-size: 12px;
  margin: 4px 0;
}

.ge-acao-botoes {
  display: flex;
  gap: 4px;
}

.ge-meta,
.ge-historico {
  font-size: 11px;
  margin-bottom: 3px;
}
</style>
