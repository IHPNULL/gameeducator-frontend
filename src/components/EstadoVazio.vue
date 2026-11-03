<script setup>
defineProps({
  icone: { type: String, default: 'mdi-inbox-outline' },
  mensagem: { type: String, required: true },
})
</script>

<template>
  <div class="ge-vazio win-sunken">
    <v-icon :icon="icone" size="28" class="ge-vazio__icone" />
    <p class="ge-vazio__msg">{{ mensagem }}</p>
    <p class="ge-vazio__obs">0 objeto(s) &mdash; 0 bytes</p>
  </div>
</template>

<style scoped>
.ge-vazio {
  text-align: center;
  padding: 18px 10px;
}

.ge-vazio__icone {
  color: var(--win-gray-dark);
  margin-bottom: 4px;
}

.ge-vazio__msg {
  font-size: 12px;
  margin: 0;
}

.ge-vazio__obs {
  font-family: var(--win-font-mono);
  font-size: 10px;
  color: var(--win-gray-dark);
  margin: 4px 0 0;
}
</style>
