<script setup>
import { onMounted } from 'vue'
import { useLaboratorio } from '../composables/useLaboratorio.js'
import CabecalhoPagina from '../components/CabecalhoPagina.vue'
import EstadoVazio from '../components/EstadoVazio.vue'

const { laboratorio, eventos, carregando, erro, carregar } = useLaboratorio('lab-1')

const LABS = [
  { id: 'lab-1', nome: 'Laboratorio 1 (Principal)' },
  { id: 'fisica', nome: 'Lab de Fisica Aplicada' },
  { id: 'quimica', nome: 'Lab de Quimica Experimental' },
]

function trocarLab(novoLab) {
  carregar(novoLab)
}

function formatarData(dataStr) {
  if (!dataStr) return '-'
  return new Date(dataStr).toLocaleString('pt-BR')
}

onMounted(() => {
  carregar()
})
</script>

<template>
  <section class="ge-lab-page">
    <CabecalhoPagina
      titulo="Laboratorio IoT & Telemetria"
      subtitulo="Monitoramento em tempo real de dispositivos conectados e atividades experimentais"
      icone="mdi-chip"
    >
      <template #acao>
        <button class="win-btn win-btn-default font-weight-bold" :disabled="carregando" @click="carregar()">
          &#8635; Atualizar Telemetria
        </button>
      </template>
    </CabecalhoPagina>

    <!-- Seletor de Laboratorio (Abas de Hardware) -->
    <div class="win-tabs-bar mb-3">
      <button
        v-for="lab in LABS"
        :key="lab.id"
        :class="['win-tab', { active: laboratorio === lab.id }]"
        @click="trocarLab(lab.id)"
      >
        &#128225; {{ lab.nome }}
      </button>
    </div>

    <!-- Indicadores de Telemetria / Painel SCADA -->
    <div class="ge-scada-kpis mb-3">
      <fieldset class="win-groupbox ge-kpi">
        <legend class="ge-legenda">Total de Eventos Recebidos</legend>
        <div class="ge-lcd">{{ eventos.total ?? 0 }}</div>
        <span class="ge-nota"><span class="ge-led ge-led--verde" />Gravacao idempotente ativa</span>
      </fieldset>

      <fieldset class="win-groupbox ge-kpi">
        <legend class="ge-legenda">Protocolo de Borda</legend>
        <div class="ge-lcd ge-lcd--azul">MQTT 3.1.1</div>
        <span class="ge-nota"><span class="ge-led ge-led--azul" />QoS 1 com LWT ativo</span>
      </fieldset>

      <fieldset class="win-groupbox ge-kpi">
        <legend class="ge-legenda">Estado da Interface Serial</legend>
        <div class="ge-lcd ge-lcd--ambar">RS-232 / 9600</div>
        <span class="ge-nota"><span class="ge-led ge-led--ambar" />Buffer RX/TX: 100% OK</span>
      </fieldset>
    </div>

    <div v-if="carregando" class="win-sunken-panel my-2">Lendo buffer de telemetria IoT...</div>
    <div v-if="erro" class="ge-aviso ge-aviso--erro win-raised mb-2">&#10006; {{ erro }}</div>

    <!-- Tabela de Eventos de Telemetria -->
    <fieldset class="win-groupbox">
      <legend class="ge-legenda">
        Fila de Telemetria de Sensores &mdash; {{ laboratorio.toUpperCase() }}
      </legend>

      <table v-if="eventos.recentes && eventos.recentes.length" class="win-table">
        <thead>
          <tr>
            <th>ID Evento</th>
            <th>Dispositivo de Borda</th>
            <th>Tipo</th>
            <th>Atividade / Experimento</th>
            <th class="ge-col-usr">Aluno</th>
            <th>Data e Hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evt in eventos.recentes" :key="evt.eventoId">
            <td class="ge-mono">{{ evt.eventoId }}</td>
            <td class="ge-mono"><strong>{{ evt.dispositivo }}</strong></td>
            <td>
              <span class="ge-tag-tipo win-sunken-panel">{{ evt.tipo }}</span>
            </td>
            <td>{{ evt.atividade }}</td>
            <td class="ge-mono">USR#{{ evt.alunoId }}</td>
            <td class="ge-mono">{{ formatarData(evt.ocorridoEm) }}</td>
          </tr>
        </tbody>
      </table>

      <EstadoVazio
        v-else-if="!carregando && !erro"
        icone="mdi-chip-outline"
        mensagem="Nenhum evento de telemetria registrado para este laboratorio."
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

.ge-scada-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.ge-lcd {
  background: #0a1a0a;
  color: #33ff33;
  font-family: var(--win-font-mono);
  font-size: 22px;
  line-height: 1.1;
  padding: 4px 8px;
  text-align: right;
  border-top: 2px solid var(--win-gray-dark);
  border-left: 2px solid var(--win-gray-dark);
  border-right: 2px solid var(--win-white);
  border-bottom: 2px solid var(--win-white);
  text-shadow: 0 0 4px currentColor;
}

.ge-lcd--azul {
  color: #38bdf8;
}

.ge-lcd--ambar {
  color: #ffbb00;
}

.ge-nota {
  display: block;
  font-size: 10px;
  margin-top: 3px;
}

.ge-led {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid #000;
  margin-right: 4px;
  vertical-align: middle;
}

.ge-led--verde { background: #00d000; box-shadow: 0 0 3px #00ff00; }
.ge-led--azul { background: #0088ff; box-shadow: 0 0 3px #0088ff; }
.ge-led--ambar { background: #ffaa00; box-shadow: 0 0 3px #ffaa00; }

.ge-aviso {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: bold;
}

.ge-aviso--erro {
  color: #c00000;
}

.ge-tag-tipo {
  font-size: 10px !important;
  font-weight: bold;
  padding: 1px 4px !important;
}

.ge-col-usr {
  width: 80px;
}
</style>
