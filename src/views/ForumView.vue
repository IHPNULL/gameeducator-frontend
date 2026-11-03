<script setup>
import { onMounted } from 'vue'
import { useForum } from '../composables/useForum.js'
import CampoTexto from '../components/CampoTexto.vue'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'
import EstadoVazio from '../components/EstadoVazio.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { posts, novoPost, rascunhoResposta, carregando, erro, carregar, publicar, responder } =
  useForum(props.cursoId)

onMounted(carregar)
</script>

<template>
  <section class="ge-forum-page">
    <CabecalhoPagina
      titulo="Forum"
      subtitulo="Tire duvidas, compartilhe solucoes e colabore com os colegas do curso"
      icone="mdi-forum"
    />

    <!-- Publicar nova duvida (Compositor de Mensagem BBS) -->
    <fieldset class="win-groupbox mb-3">
      <legend class="ge-legenda">Nova Mensagem no Forum (BBS)</legend>
      <CampoTexto
        v-model="novoPost.titulo"
        testid="novo-post-titulo"
        label="Assunto da mensagem"
        class="mb-2"
      />
      <CampoTexto
        v-model="novoPost.conteudo"
        testid="novo-post-conteudo"
        label="Texto da mensagem"
        type="textarea"
        class="mb-2"
      />
      <div class="d-flex justify-end">
        <button
          data-testid="publicar-post"
          class="win-btn win-btn-default font-weight-bold"
          @click="publicar"
        >
          &#9993; Publicar no Forum
        </button>
      </div>
    </fieldset>

    <div v-if="carregando" class="win-sunken-panel my-2">Sincronizando topicos do FORUM.BBS...</div>
    <div v-if="erro" class="ge-aviso ge-aviso--erro win-raised mb-2">&#10006; {{ erro }}</div>

    <!-- Lista de posts -->
    <div v-for="post in posts" :key="post.id" class="ge-post win-raised mb-3">
      <div class="ge-post__cabecalho">
        <span class="ge-post__assunto">&#128196; Assunto: <strong>{{ post.titulo }}</strong></span>
        <span class="ge-mono">MSG #{{ post.id }} &middot; De: <strong>{{ post.autorNome }}</strong></span>
      </div>

      <div class="ge-post__corpo win-sunken">
        {{ post.conteudo }}
      </div>

      <!-- Respostas na thread -->
      <div v-if="post.respostas && post.respostas.length" class="ge-thread">
        <div class="ge-thread__rotulo">Respostas na discussao:</div>
        <div v-for="resp in post.respostas" :key="resp.id" class="ge-resposta win-raised">
          <div class="ge-resposta__meta">
            <span>&#8627; De: <strong>{{ resp.autorNome }}</strong></span>
            <span v-if="resp.dataHora" class="ge-mono">
              {{ new Date(resp.dataHora).toLocaleString('pt-BR') }}
            </span>
          </div>
          <div class="ge-resposta__conteudo win-sunken">
            {{ resp.conteudo }}
          </div>
        </div>
      </div>

      <!-- Formulario de resposta -->
      <div class="ge-responder">
        <label class="ge-campo">
          <span class="ge-campo__label">Responder a este topico:</span>
          <div class="d-flex ga-2">
            <input
              v-model="rascunhoResposta[post.id]"
              :data-testid="`resposta-${post.id}`"
              class="win-sunken flex-grow-1"
              placeholder="Digite sua resposta..."
              @keyup.enter="responder(post.id)"
            />
            <button
              :data-testid="`responder-${post.id}`"
              class="win-btn"
              @click="responder(post.id)"
            >
              Responder
            </button>
          </div>
        </label>
      </div>
    </div>

    <EstadoVazio
      v-if="!carregando && !erro && posts.length === 0"
      icone="mdi-forum-outline"
      mensagem="Nenhum topico publicado neste forum ainda. Seja o primeiro a postar!"
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
}

.ge-aviso {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: bold;
}

.ge-aviso--erro {
  color: #c00000;
}

.ge-post {
  padding: 2px;
}

.ge-post__cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--win-gray-dark);
  color: #fff;
  padding: 3px 6px;
  font-size: 11px;
}

.ge-post__assunto {
  font-size: 12px;
}

.ge-post__corpo {
  padding: 8px 10px;
  margin: 4px;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
}

.ge-thread {
  margin: 6px 4px;
  padding-left: 14px;
  border-left: 2px groove var(--win-gray-light);
}

.ge-thread__rotulo {
  font-size: 10px;
  font-weight: bold;
  color: var(--win-gray-dark);
  margin-bottom: 4px;
}

.ge-resposta {
  padding: 2px;
  margin-bottom: 4px;
}

.ge-resposta__meta {
  display: flex;
  justify-content: space-between;
  padding: 2px 4px;
  font-size: 10px;
  background-color: var(--win-gray);
}

.ge-resposta__conteudo {
  padding: 4px 6px;
  margin: 2px;
  font-size: 11px;
}

.ge-responder {
  padding: 4px 6px;
}

.ge-campo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.ge-campo__label {
  font-size: 10px;
  font-weight: bold;
}

.ge-campo input {
  padding: 3px 4px;
  font-size: 11px;
  outline: none;
}
</style>
