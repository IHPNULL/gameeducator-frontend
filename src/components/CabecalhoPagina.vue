<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  icone: { type: String, default: '' },
})
</script>

<template>
  <header class="ge-cabecalho">
    <div class="d-flex align-center ga-2">
      <span v-if="icone" class="ge-cabecalho__icone win-raised">
        <v-icon :icon="icone" size="20" />
      </span>
      <div>
        <h2 class="ge-cabecalho__titulo">{{ titulo }}</h2>
        <p v-if="subtitulo" class="ge-cabecalho__sub">{{ subtitulo }}</p>
      </div>
    </div>
    <slot name="acao" />
  </header>
</template>

<style scoped>
.ge-cabecalho {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 6px;
  margin-bottom: 8px;
  border-bottom: 2px groove var(--win-gray-light);
}

.ge-cabecalho__icone {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ge-cabecalho__titulo {
  font-size: 15px;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}

.ge-cabecalho__sub {
  font-size: 11px;
  margin: 1px 0 0;
}
</style>
