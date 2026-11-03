<script setup>
import { useCriarMissao } from '../composables/useCriarMissao.js'
import DesafioForm from '../components/DesafioForm.vue'
import CampoTexto from '../components/CampoTexto.vue'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { missoes, form, erro, salvando, salvar } = useCriarMissao(props.cursoId)
</script>

<template>
  <section class="ge-nova-missao-page">
    <CabecalhoPagina
      titulo="Nova missao"
      subtitulo="Publique uma missao gamificada com seus desafios e pontuacao para a turma"
      icone="mdi-plus-box"
    />

    <v-card class="mb-5 pa-2 rounded-xl" elevation="0">
      <v-card-item class="pb-1">
        <v-card-title class="font-weight-bold text-subtitle-1">Dados da Missao</v-card-title>
      </v-card-item>
      <v-card-text>
        <CampoTexto v-model="form.titulo" testid="titulo" label="Titulo da Missao" class="mb-3" />
        <CampoTexto v-model="form.descricao" testid="descricao" label="Descricao dos objetivos de aprendizagem" type="textarea" />
      </v-card-text>
    </v-card>

    <DesafioForm v-for="(desafio, i) in form.desafios" :key="i" v-model="form.desafios[i]" :index="i" />

    <v-alert v-if="erro" type="error" class="mb-4">{{ erro }}</v-alert>

    <div class="mb-8">
      <v-btn
        data-testid="salvar"
        variant="flat"
        color="primary"
        size="large"
        prepend-icon="mdi-content-save"
        :loading="salvando"
        class="font-weight-bold px-6"
        @click="salvar"
      >
        Salvar e Publicar Missao
      </v-btn>
    </div>

    <!-- Lista de Missoes Existentes -->
    <v-card elevation="0" class="rounded-xl">
      <v-card-item class="border-b py-3 px-4">
        <span class="font-weight-bold text-subtitle-1">Missoes do curso</span>
      </v-card-item>
      <v-list density="comfortable" class="py-2">
        <v-list-item
          v-for="missao in missoes"
          :key="missao.id"
          :title="missao.titulo"
          class="px-4"
        >
          <template #prepend>
            <v-avatar color="primary" size="32" rounded="lg" class="mr-3">
              <v-icon icon="mdi-flag-variant" color="white" size="18" />
            </v-avatar>
          </template>
          <template #append>
            <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold">
              {{ missao.xpTotal }} XP
            </v-chip>
          </template>
        </v-list-item>
        <v-list-item v-if="missoes.length === 0" class="text-medium-emphasis pa-4 text-center">
          Nenhuma missao cadastrada ate agora.
        </v-list-item>
      </v-list>
    </v-card>
  </section>
</template>
