<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIa } from '../composables/useIa.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const router = useRouter()
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
  router.push('/missoes')
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
        <v-chip
          :color="recomendacoes.origem === 'ia' ? 'success' : 'info'"
          variant="flat"
          size="large"
          prepend-icon="mdi-brain"
        >
          IA: {{ recomendacoes.origem === 'ia' ? 'Conectada (RAG)' : 'Modo Fallback' }}
        </v-chip>
      </template>
    </CabecalhoPagina>

    <!-- Recomendacoes de Missoes -->
    <v-card class="mb-6 ge-card-destaque" elevation="0">
      <v-card-item class="pb-2">
        <template #prepend>
          <v-avatar color="primary" rounded="lg" size="44">
            <v-icon icon="mdi-lightbulb-on-outline" color="white" />
          </v-avatar>
        </template>
        <v-card-title class="text-subtitle-1 font-weight-bold">
          Missoes Recomendadas para o seu Perfil
        </v-card-title>
        <v-card-subtitle>
          Recomendacao personalizada baseada no seu progresso no curso
        </v-card-subtitle>
        <template #append>
          <v-btn
            size="small"
            variant="text"
            icon="mdi-refresh"
            :loading="carregandoRecomendacoes"
            aria-label="Atualizar recomendacoes"
            @click="carregarRecomendacoes"
          />
        </template>
      </v-card-item>

      <v-card-text>
        <div v-if="recomendacoes.itens && recomendacoes.itens.length" class="d-flex flex-wrap ga-3">
          <v-card
            v-for="item in recomendacoes.itens"
            :key="item.missaoId"
            variant="outlined"
            class="flex-grow-1 ge-rec-item pa-3"
            @click="abrirMissao"
          >
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-2 font-weight-bold">{{ item.titulo }}</span>
              <v-chip color="primary" size="x-small" variant="tonal">
                Score: {{ (item.pontuacao * 100).toFixed(0) }}%
              </v-chip>
            </div>
            <p class="text-body-2 text-medium-emphasis mb-2">{{ item.motivo }}</p>
            <div class="d-flex justify-end">
              <v-btn size="x-small" variant="tonal" append-icon="mdi-arrow-right">
                Jogar agora
              </v-btn>
            </div>
          </v-card>
        </div>
        <div v-else class="text-caption text-medium-emphasis">
          Nenhuma recomendacao pendente. Todas as missoes concluidas ou indisponiveis.
        </div>
      </v-card-text>
    </v-card>

    <!-- Chat com o Assistente -->
    <v-card class="ge-chat-container d-flex flex-column" elevation="0">
      <v-card-item class="border-b py-3 px-4">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-message-text-outline" color="primary" />
          <span class="font-weight-bold text-body-1">Conversa com o Tutor Virtual</span>
        </div>
      </v-card-item>

      <v-card-text class="flex-grow-1 ge-chat-mensagens pa-4">
        <div
          v-for="(msg, i) in mensagens"
          :key="i"
          :class="['d-flex mb-4', msg.tipo === 'usuario' ? 'justify-end' : 'justify-start']"
        >
          <div
            :class="[
              'ge-bolha pa-3 rounded-xl',
              msg.tipo === 'usuario' ? 'ge-bolha-usuario bg-primary text-white' : 'ge-bolha-ia bg-surface-variant'
            ]"
          >
            <div class="d-flex align-center justify-space-between mb-1 ga-4">
              <span class="text-caption font-weight-bold">
                {{ msg.tipo === 'usuario' ? 'Voce' : 'Assistente IA' }}
              </span>
              <span class="text-caption opacity-70">{{ msg.dataHora }}</span>
            </div>

            <p class="text-body-2 mb-2 text-wrap" style="white-space: pre-line;">{{ msg.conteudo }}</p>

            <!-- Fontes citadas pelo RAG -->
            <div v-if="msg.fontes && msg.fontes.length" class="mt-2 pt-2 border-t">
              <span class="text-caption font-weight-bold d-block mb-1">
                <v-icon icon="mdi-book-open-outline" size="14" class="mr-1" />
                Fontes consultadas:
              </span>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="fonte in msg.fontes"
                  :key="fonte.id"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                >
                  {{ fonte.titulo }} ({{ (fonte.relevancia * 100).toFixed(0) }}%)
                </v-chip>
              </div>
            </div>
          </div>
        </div>

        <div v-if="carregandoResposta" class="d-flex justify-start mb-4">
          <div class="ge-bolha ge-bolha-ia pa-3 rounded-xl bg-surface-variant d-flex align-center ga-2">
            <v-progress-circular indeterminate size="18" width="2" color="primary" />
            <span class="text-body-2">Consultando o conteudo do curso...</span>
          </div>
        </div>
      </v-card-text>

      <!-- Sugestoes de perguntas -->
      <div class="px-4 py-2 border-t bg-background d-flex flex-wrap ga-2">
        <v-chip
          v-for="sugestao in SUGESTOES"
          :key="sugestao"
          size="small"
          variant="tonal"
          class="cursor-pointer"
          @click="enviar(sugestao)"
        >
          {{ sugestao }}
        </v-chip>
      </div>

      <!-- Barra de envio -->
      <div class="pa-3 border-t bg-surface">
        <form @submit.prevent="enviar()" class="d-flex align-center ga-2">
          <v-text-field
            v-model="textoPergunta"
            placeholder="Digite sua duvida sobre o curso..."
            variant="solo-filled"
            flat
            density="compact"
            rounded="xl"
            hide-details
            :disabled="carregandoResposta"
          />
          <v-btn
            color="primary"
            icon="mdi-send"
            rounded="circle"
            :loading="carregandoResposta"
            :disabled="!textoPergunta.trim()"
            aria-label="Enviar mensagem"
            type="submit"
          />
        </form>
      </div>
    </v-card>
  </section>
</template>

<style scoped>
.ge-chat-container {
  min-height: 480px;
  border-radius: 16px;
  overflow: hidden;
}

.ge-chat-mensagens {
  max-height: 440px;
  overflow-y: auto;
}

.ge-bolha {
  max-width: 82%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ge-card-destaque {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.06) 0%, rgba(var(--v-theme-surface), 1) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.ge-rec-item {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.ge-rec-item:hover {
  transform: translateY(-2px);
  border-color: rgb(var(--v-theme-primary));
}

.cursor-pointer {
  cursor: pointer;
}
</style>
