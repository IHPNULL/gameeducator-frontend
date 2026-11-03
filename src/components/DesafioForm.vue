<script setup>
import CampoTexto from './CampoTexto.vue'

defineProps({
  modelValue: { type: Object, required: true },
  index: { type: Number, required: true },
})
</script>

<template>
  <v-card class="mb-4 rounded-xl" variant="outlined">
    <v-card-text>
      <div class="d-flex align-center ga-2 mb-3">
        <v-avatar color="primary" size="28" rounded="lg">
          <v-icon icon="mdi-help-circle-outline" color="white" size="16" />
        </v-avatar>
        <span class="text-subtitle-2 text-uppercase font-weight-bold text-primary ge-secao">
          Desafio {{ index + 1 }}
        </span>
      </div>

      <CampoTexto
        v-model="modelValue.enunciado"
        :testid="`desafio-${index}-enunciado`"
        label="Enunciado da pergunta / exercicio"
        class="mb-3"
      />

      <div class="mb-3">
        <span class="text-caption font-weight-bold text-medium-emphasis d-block mb-2">
          Alternativas de Resposta:
        </span>
        <CampoTexto
          v-for="(alt, j) in modelValue.alternativas"
          :key="j"
          v-model="modelValue.alternativas[j]"
          :testid="`desafio-${index}-alternativa-${j}`"
          :label="`Alternativa ${j + 1} (${String.fromCharCode(65 + j)})`"
          class="mb-2"
        />
      </div>

      <v-row density="compact">
        <v-col cols="12" sm="6">
          <CampoTexto
            v-model="modelValue.indiceRespostaCorreta"
            :testid="`desafio-${index}-indiceCorreto`"
            label="Indice da correta (0 = A, 1 = B...)"
            type="number"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <CampoTexto
            v-model="modelValue.xp"
            :testid="`desafio-${index}-xp`"
            label="XP concedido pelo acerto"
            type="number"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.ge-secao {
  letter-spacing: 0.08em;
}
</style>
