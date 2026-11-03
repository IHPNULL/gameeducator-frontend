<script setup>
import { computed } from 'vue'

/**
 * Campo de texto no estilo caixa de edicao do Windows 95 (rotulo acima,
 * controle rebaixado em branco).
 *
 * Usa <input>/<textarea> nativos de proposito: o Vuetify manda todo atributo
 * "data-*" para a div externa do v-text-field, e as suites de teste (Vitest e
 * Cucumber/Playwright) preenchem o campo pelo data-testid. Com o campo nativo,
 * o testid fica no proprio controle e o "fill"/"setValue" funciona.
 */
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  testid: { type: String, default: undefined },
  type: { type: String, default: 'text' },
  rows: { type: Number, default: 3 },
})

const emit = defineEmits(['update:modelValue', 'change'])

const multilinha = computed(() => props.type === 'textarea')

function aoDigitar(evento) {
  const valor = evento.target.value
  emit('update:modelValue', props.type === 'number' && valor !== '' ? Number(valor) : valor)
}
</script>

<template>
  <label class="ge-campo">
    <span class="ge-campo__label">{{ label }}:</span>
    <textarea
      v-if="multilinha"
      class="ge-campo__controle win-sunken"
      :data-testid="testid"
      :rows="rows"
      :value="modelValue"
      @input="aoDigitar"
      @change="emit('change', $event)"
    />
    <input
      v-else
      class="ge-campo__controle win-sunken"
      :data-testid="testid"
      :type="type"
      :value="modelValue"
      @input="aoDigitar"
      @change="emit('change', $event)"
    />
  </label>
</template>

<style scoped>
.ge-campo {
  display: block;
  width: 100%;
}

.ge-campo__label {
  display: block;
  font-size: 11px;
  margin-bottom: 2px;
  color: var(--win-black);
}

.ge-campo__controle {
  width: 100%;
  padding: 3px 4px;
  font-family: var(--win-font-sans);
  font-size: 12px;
  outline: none;
  border-radius: 0;
}

.ge-campo__controle:focus {
  outline: 1px dotted var(--win-black);
  outline-offset: -4px;
}

textarea.ge-campo__controle {
  display: block;
  resize: vertical;
  min-height: 60px;
  font-family: var(--win-font-mono);
}
</style>
