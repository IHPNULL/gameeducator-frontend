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

/** Iniciais do autor para o avatar da publicacao. */
function iniciais(nome) {
  return (nome ?? '?').trim().charAt(0).toUpperCase()
}

onMounted(carregar)
</script>

<template>
  <section class="ge-forum-page">
    <CabecalhoPagina
      titulo="Forum"
      subtitulo="Tire duvidas, compartilhe solucoes e colabore com os colegas do curso"
      icone="mdi-forum"
    />

    <!-- Card de Publicar Nova Duvida -->
    <v-card class="mb-6 ge-novo-post-card rounded-xl" elevation="0">
      <v-card-item class="pb-1 pt-4 px-5">
        <div class="d-flex align-center ga-2">
          <v-avatar color="primary" size="32">
            <v-icon icon="mdi-pencil-outline" color="white" size="18" />
          </v-avatar>
          <v-card-title class="text-subtitle-1 font-weight-bold">Criar Nova Publicacao</v-card-title>
        </div>
      </v-card-item>
      <v-card-text class="px-5 pt-3">
        <CampoTexto
          v-model="novoPost.titulo"
          testid="novo-post-titulo"
          label="Titulo da sua duvida ou topico"
          class="mb-3"
        />
        <CampoTexto
          v-model="novoPost.conteudo"
          testid="novo-post-conteudo"
          label="Explique sua duvida em detalhes..."
          type="textarea"
        />
      </v-card-text>
      <v-card-actions class="px-5 pb-4 pt-0">
        <v-spacer />
        <v-btn
          data-testid="publicar-post"
          variant="flat"
          color="primary"
          prepend-icon="mdi-send"
          class="px-5 font-weight-bold"
          @click="publicar"
        >
          Publicar no Forum
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-progress-linear v-if="carregando" color="primary" indeterminate rounded class="mb-4" />
    <v-alert v-if="erro" type="error" class="mb-4">{{ erro }}</v-alert>

    <!-- Lista de Posts do Forum -->
    <v-card
      v-for="post in posts"
      :key="post.id"
      class="mb-5 ge-post-card rounded-xl"
      elevation="0"
    >
      <v-card-item class="pb-2 pt-4 px-5">
        <template #prepend>
          <v-avatar color="primary" size="42" class="font-weight-bold text-white">
            {{ iniciais(post.autorNome) }}
          </v-avatar>
        </template>
        <v-card-title class="text-wrap text-h6 font-weight-bold">
          {{ post.titulo }}
        </v-card-title>
        <v-card-subtitle class="text-wrap text-body-2 mt-1">
          <span class="font-weight-medium text-primary">{{ post.autorNome }}</span>: {{ post.conteudo }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="px-5 pb-4">
        <!-- Respostas existentes -->
        <div v-if="post.respostas && post.respostas.length" class="ge-respostas mb-4 mt-2">
          <div
            v-for="resposta in post.respostas"
            :key="resposta.id"
            class="ge-resposta-item pa-3 rounded-lg bg-surface-variant mb-2"
          >
            <div class="d-flex align-center ga-2 mb-1">
              <v-avatar color="secondary" size="24" class="text-white text-caption font-weight-bold">
                {{ iniciais(resposta.autorNome) }}
              </v-avatar>
              <strong class="text-caption font-weight-bold text-primary">{{ resposta.autorNome }}</strong>
            </div>
            <p class="ge-resposta-texto text-body-2 mb-0 pl-7">
              {{ resposta.conteudo }}
            </p>
          </div>
        </div>

        <v-divider class="my-3" />

        <!-- Caixa de Resposta -->
        <div class="d-flex align-center ga-3 flex-wrap">
          <CampoTexto
            v-model="rascunhoResposta[post.id]"
            :testid="`resposta-${post.id}`"
            label="Escreva uma resposta para este topico..."
            class="flex-grow-1 ge-resposta"
          />
          <v-btn
            :data-testid="`responder-${post.id}`"
            variant="flat"
            color="primary"
            prepend-icon="mdi-reply"
            @click="responder(post.id)"
          >
            Responder
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="!carregando && !erro && posts.length === 0" elevation="0">
      <EstadoVazio
        icone="mdi-forum-outline"
        mensagem="Ainda nao ha publicacoes no forum deste curso. Seja o primeiro a perguntar!"
      />
    </v-card>
  </section>
</template>

<style scoped>
.ge-novo-post-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 0.5) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.ge-post-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: box-shadow 0.2s ease;
}

.ge-post-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
</style>
