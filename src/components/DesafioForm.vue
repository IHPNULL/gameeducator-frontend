<script setup>
import CampoTexto from './CampoTexto.vue'

defineProps({
  modelValue: { type: Object, required: true },
  index: { type: Number, required: true },
})
</script>

<template>
  <fieldset class="win-groupbox ge-desafio">
    <legend class="ge-desafio__legenda">Desafio {{ index + 1 }}</legend>

    <CampoTexto
      v-model="modelValue.enunciado"
      :testid="`desafio-${index}-enunciado`"
      label="Enunciado da pergunta / exercicio"
      class="mb-2"
    />

    <div class="ge-desafio__alts">
      <CampoTexto
        v-for="(alt, j) in modelValue.alternativas"
        :key="j"
        v-model="modelValue.alternativas[j]"
        :testid="`desafio-${index}-alternativa-${j}`"
        :label="`Alternativa ${j + 1} (${String.fromCharCode(65 + j)})`"
      />
    </div>

    <div class="ge-desafio__linha">
      <CampoTexto
        v-model="modelValue.indiceRespostaCorreta"
        :testid="`desafio-${index}-indiceCorreto`"
        label="Indice da correta (0 = A, 1 = B...)"
        type="number"
      />
      <CampoTexto
        v-model="modelValue.xp"
        :testid="`desafio-${index}-xp`"
        label="XP concedido pelo acerto"
        type="number"
      />
    </div>
  </fieldset>
</template>

<style scoped>
.ge-desafio__legenda {
  font-weight: bold;
  font-size: 11px;
  padding: 0 3px;
}

.ge-desafio__alts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 6px;
  margin-bottom: 8px;
}

.ge-desafio__linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>
