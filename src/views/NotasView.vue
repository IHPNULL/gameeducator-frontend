<script setup>
import { computed, onMounted } from 'vue'
import { useNotas } from '../composables/useNotas.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'
import EstadoVazio from '../components/EstadoVazio.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { notas, carregando, erro, carregar } = useNotas(props.cursoId)

const media = computed(() => {
  if (notas.value.length === 0) return null
  const soma = notas.value.reduce((total, nota) => total + Number(nota.valor), 0)
  return (soma / notas.value.length).toFixed(1)
})

function statusAprovacao(valor) {
  return Number(valor) >= 6 ? 'Aprovado' : 'Em Recuperacao'
}

onMounted(carregar)
</script>

<template>
  <section class="ge-notas-page">
    <CabecalhoPagina
      titulo="Minhas notas"
      subtitulo="Acompanhe suas avaliacoes formais, notas lancadas e desempenho academico"
      icone="mdi-clipboard-text"
    >
      <template #acao>
        <span v-if="media" class="win-sunken-panel">
          MEDIA GERAL: {{ media }} / 10.0
        </span>
      </template>
    </CabecalhoPagina>

    <!-- Resumo do Boletim -->
    <fieldset v-if="notas.length" class="win-groupbox mb-3">
      <legend class="ge-legenda">Situacao Geral no Curso</legend>
      <div class="d-flex align-center justify-space-between flex-wrap ga-2">
        <div>
          <strong>{{ Number(media) >= 6 ? 'Rendimento Adequado' : 'Abaixo da Media de Aprovacao' }}</strong>
          <p class="ge-dica">
            {{ notas.length }} avaliacao(oes) computada(s). A media minima para aprovacao e 6.0.
          </p>
        </div>
        <div class="ge-lcd">
          MEDIA: {{ media }}
        </div>
      </div>
    </fieldset>

    <div v-if="carregando" class="win-sunken-panel my-2">Lendo NOTAS.DBF...</div>
    <div v-if="erro" class="ge-aviso ge-aviso--erro win-raised mb-2">&#10006; {{ erro }}</div>

    <!-- Tabela do Boletim -->
    <fieldset class="win-groupbox">
      <legend class="ge-legenda">Boletim Escolar de Avaliacoes</legend>
      <table v-if="notas.length" class="win-table">
        <thead>
          <tr>
            <th class="ge-col-id">Item</th>
            <th>Descricao da Avaliacao</th>
            <th class="ge-dir ge-col-nota">Nota</th>
            <th class="ge-col-st">Situacao</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(n, i) in notas" :key="n.id">
            <td class="ge-mono">#{{ i + 1 }}</td>
            <td><strong>{{ n.avaliacao }}</strong></td>
            <td class="ge-dir ge-mono"><strong>{{ n.valor }}</strong></td>
            <td>
              <span :class="Number(n.valor) >= 6 ? 'ge-ok' : 'ge-erro'">
                {{ statusAprovacao(n.valor) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <EstadoVazio
        v-else-if="!carregando && !erro"
        icone="mdi-clipboard-outline"
        mensagem="Nenhuma nota formal foi registrada para voce neste curso."
      />
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

.ge-dica {
  font-size: 10px;
  margin: 2px 0 0;
}

.ge-lcd {
  background: #0a1a0a;
  color: #33ff33;
  font-family: var(--win-font-mono);
  font-size: 20px;
  line-height: 1.1;
  padding: 3px 8px;
  border-top: 2px solid var(--win-gray-dark);
  border-left: 2px solid var(--win-gray-dark);
  border-right: 2px solid var(--win-white);
  border-bottom: 2px solid var(--win-white);
  text-shadow: 0 0 4px #33ff33;
}

.ge-aviso {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: bold;
}

.ge-aviso--erro {
  color: #c00000;
}

.ge-col-id { width: 44px; }
.ge-col-nota { width: 80px; }
.ge-col-st { width: 130px; }

.ge-ok { color: #008000; font-weight: bold; }
.ge-erro { color: #c00000; font-weight: bold; }
</style>
