<script setup>
import { onMounted } from 'vue'
import { useRanking } from '../composables/useRanking.js'
import { useMedalhas } from '../composables/useMedalhas.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'

const props = defineProps({
  cursoId: { type: Number, required: true },
})

const { ranking, carregando, erro, carregar, souEu } = useRanking(props.cursoId)
const { medalhas, carregarMedalhas } = useMedalhas(props.cursoId)

/** Medalhas de destaque para o podio */
const CORES_DO_PODIO = { 1: '#F59E0B', 2: '#94A3B8', 3: '#B45309' }

const CONQUISTAS_POSSIVEIS = [
  { marco: 50, titulo: 'Iniciante', icone: 'mdi-star-outline', descricao: 'Alcancou 50 XP' },
  { marco: 100, titulo: 'Aprendiz', icone: 'mdi-shield-star', descricao: 'Alcancou 100 XP' },
  { marco: 250, titulo: 'Mestre', icone: 'mdi-crown-outline', descricao: 'Alcancou 250 XP' },
  { marco: 500, titulo: 'Lenda', icone: 'mdi-trophy-award', descricao: 'Alcancou 500 XP' },
]

function possuiMedalha(marco) {
  return medalhas.value.some((m) => m.marcoXp === marco)
}

onMounted(() => {
  carregar()
  carregarMedalhas()
})
</script>

<template>
  <section class="ge-ranking-page">
    <CabecalhoPagina
      titulo="Ranking da turma"
      subtitulo="Acompanhe a classificacao de XP dos alunos e veja suas conquistas desbloqueadas"
      icone="mdi-trophy"
    >
      <template #acao>
        <span class="win-sunken-panel">TEMPORADA ATIVA</span>
      </template>
    </CabecalhoPagina>

    <!-- Quadro de medalhas -->
    <fieldset class="win-groupbox">
      <legend class="ge-legenda">
        Quadro de Medalhas &mdash; {{ medalhas.length }} de {{ CONQUISTAS_POSSIVEIS.length }} desbloqueadas
      </legend>
      <div class="ge-medalhas">
        <div
          v-for="c in CONQUISTAS_POSSIVEIS"
          :key="c.marco"
          :class="['ge-medalha', possuiMedalha(c.marco) ? 'win-raised' : 'win-sunken ge-medalha--bloq']"
        >
          <v-icon :icon="c.icone" size="22" :class="possuiMedalha(c.marco) ? 'ge-ouro' : ''" />
          <div class="ge-medalha__info">
            <strong>{{ c.titulo }}</strong>
            <span class="ge-mono">{{ c.marco }} XP</span>
            <span class="ge-medalha__st">{{ possuiMedalha(c.marco) ? 'Conquistada' : 'Bloqueada' }}</span>
          </div>
        </div>
      </div>
    </fieldset>

    <div v-if="carregando" class="win-sunken-panel my-2">Consultando RANKING.DBF...</div>
    <div v-if="erro" class="ge-erro win-raised">&#10006; {{ erro }}</div>

    <!-- Classificacao -->
    <fieldset class="win-groupbox">
      <legend class="ge-legenda">Classificacao Geral &mdash; {{ ranking.length }} competidores</legend>
      <table class="win-table">
        <thead>
          <tr>
            <th class="ge-col-pos">Pos.</th>
            <th>Aluno</th>
            <th class="ge-col-id">ID</th>
            <th class="ge-col-xp">XP Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in ranking"
            :key="item.alunoId"
            :data-testid="`ranking-linha-${item.alunoId}`"
            :class="{ 'ranking-eu': souEu(item.alunoId) }"
          >
            <td class="ge-mono">
              <span :style="{ color: souEu(item.alunoId) ? undefined : CORES_DO_PODIO[item.posicao] }">
                {{ item.posicao <= 3 ? '&#9733;' : '&nbsp;' }}
              </span>
              {{ String(item.posicao).padStart(2, '0') }}
            </td>
            <td>
              {{ item.posicao }}. {{ item.nomeAluno }}
              <span v-if="souEu(item.alunoId)"> &lt;-- voce</span>
            </td>
            <td class="ge-mono">{{ item.alunoId }}</td>
            <td class="ge-mono ge-col-xp">{{ item.xpTotal }} XP</td>
          </tr>
          <tr v-if="!carregando && !erro && ranking.length === 0">
            <td colspan="4" class="ge-vazio">Ninguem pontuou neste curso ainda.</td>
          </tr>
        </tbody>
      </table>
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

.ge-medalhas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 6px;
}

.ge-medalha {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-size: 11px;
}

.ge-medalha--bloq {
  background-color: var(--win-gray) !important;
  color: var(--win-gray-dark) !important;
}

.ge-medalha__info {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.ge-medalha__st {
  font-size: 10px;
  text-transform: uppercase;
}

.ge-ouro {
  color: #b08000;
}

.ge-erro {
  padding: 4px 8px;
  margin: 6px 0;
  font-weight: bold;
  font-size: 11px;
}

.ge-col-pos { width: 56px; }
.ge-col-id { width: 50px; }
.ge-col-xp { width: 100px; text-align: right; }

.ge-vazio {
  text-align: center;
  padding: 12px !important;
  color: var(--win-gray-dark);
}
</style>
