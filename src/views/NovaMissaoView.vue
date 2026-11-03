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

    <fieldset class="win-groupbox mb-3">
      <legend class="ge-legenda">Dados Gerais da Missao</legend>
      <CampoTexto v-model="form.titulo" testid="titulo" label="Titulo da Missao" class="mb-2" />
      <CampoTexto v-model="form.descricao" testid="descricao" label="Descricao dos objetivos de aprendizagem" type="textarea" />
    </fieldset>

    <DesafioForm v-for="(desafio, i) in form.desafios" :key="i" v-model="form.desafios[i]" :index="i" />

    <div v-if="erro" class="ge-aviso ge-aviso--erro win-raised mb-3">&#10006; {{ erro }}</div>

    <div class="my-3">
      <v-btn
        data-testid="salvar"
        :loading="salvando"
        class="font-weight-bold"
        @click="salvar"
      >
        &#128190; Salvar e Publicar Missao
      </v-btn>
    </div>

    <!-- Lista de Missoes Existentes -->
    <fieldset class="win-groupbox mt-4">
      <legend class="ge-legenda">Missoes do curso &mdash; {{ missoes.length }} cadastradas</legend>
      <table v-if="missoes.length" class="win-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titulo da Missao</th>
            <th class="ge-dir">XP Total</th>
            <th class="ge-dir">Desafios</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in missoes" :key="m.id">
            <td class="ge-mono">#{{ m.id }}</td>
            <td><strong>{{ m.titulo }}</strong></td>
            <td class="ge-dir ge-mono">{{ m.xpTotal }} XP</td>
            <td class="ge-dir ge-mono">{{ m.desafios?.length ?? 0 }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="win-sunken ge-vazio">
        Nenhuma missao cadastrada ate agora.
      </div>
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

.ge-dir {
  text-align: right !important;
}

.ge-aviso {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: bold;
}

.ge-aviso--erro {
  color: #c00000;
}

.ge-vazio {
  padding: 8px;
  font-size: 11px;
  color: var(--win-gray-dark);
}
</style>
