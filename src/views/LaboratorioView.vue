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
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-refresh"
          :loading="carregando"
          @click="carregar()"
        >
          Atualizar Eventos
        </v-btn>
      </template>
    </CabecalhoPagina>

    <!-- Seletor de Laboratorio -->
    <div class="d-flex ga-2 mb-6 flex-wrap">
      <v-btn
        v-for="lab in LABS"
        :key="lab.id"
        :variant="laboratorio === lab.id ? 'flat' : 'outlined'"
        :color="laboratorio === lab.id ? 'primary' : 'on-surface'"
        rounded="pill"
        @click="trocarLab(lab.id)"
      >
        {{ lab.nome }}
      </v-btn>
    </div>

    <!-- Indicadores de Telemetria -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card class="pa-4 ge-stat-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-caption text-medium-emphasis">Total de Eventos</span>
              <h3 class="text-h4 font-weight-bold mt-1">{{ eventos.total ?? 0 }}</h3>
            </div>
            <v-avatar color="primary" rounded="lg" size="48">
              <v-icon icon="mdi-counter" color="white" />
            </v-avatar>
          </div>
          <span class="text-caption text-success mt-2 d-block">
            <v-icon icon="mdi-shield-check" size="14" /> Gravacao idempotente
          </span>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="pa-4 ge-stat-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-caption text-medium-emphasis">Protocolo de Borda</span>
              <h3 class="text-h5 font-weight-bold mt-1">MQTT 3.1.1</h3>
            </div>
            <v-avatar color="info" rounded="lg" size="48">
              <v-icon icon="mdi-access-point" color="white" />
            </v-avatar>
          </div>
          <span class="text-caption text-info mt-2 d-block">
            <v-icon icon="mdi-check-circle" size="14" /> QoS 1 com LWT ativo
          </span>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="pa-4 ge-stat-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-caption text-medium-emphasis">Integracao Core</span>
              <h3 class="text-h5 font-weight-bold mt-1">RabbitMQ + ACL</h3>
            </div>
            <v-avatar color="secondary" rounded="lg" size="48">
              <v-icon icon="mdi-transit-connection-variant" color="white" />
            </v-avatar>
          </div>
          <span class="text-caption text-secondary mt-2 d-block">
            <v-icon icon="mdi-sync" size="14" /> Camada anti-corrupcao
          </span>
        </v-card>
      </v-col>
    </v-row>

    <v-progress-linear v-if="carregando" color="primary" indeterminate rounded class="mb-4" />
    <v-alert v-if="erro" type="error" class="mb-4">{{ erro }}</v-alert>

    <!-- Tabela de Eventos Recentes -->
    <v-card elevation="0">
      <v-card-item class="border-b py-3 px-4">
        <div class="d-flex align-center justify-space-between">
          <span class="font-weight-bold text-subtitle-1">Fluxo de Eventos Recentes</span>
          <v-chip size="small" variant="tonal" color="primary">
            {{ eventos.recentes?.length ?? 0 }} registros exibidos
          </v-chip>
        </div>
      </v-card-item>

      <v-table v-if="eventos.recentes && eventos.recentes.length" class="ge-tabela">
        <thead>
          <tr>
            <th>Dispositivo</th>
            <th>Tipo</th>
            <th>Atividade</th>
            <th>Aluno ID</th>
            <th>Ocorrido em</th>
            <th>Recebido em</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evt in eventos.recentes" :key="evt.eventoId">
            <td>
              <div class="d-flex align-center ga-2">
                <v-icon icon="mdi-raspberry-pi" color="primary" size="20" />
                <span class="font-weight-medium">{{ evt.dispositivo }}</span>
              </div>
            </td>
            <td>
              <v-chip size="x-small" variant="flat" color="surface-variant">
                {{ evt.tipo }}
              </v-chip>
            </td>
            <td>{{ evt.atividade ?? 'Atividade padrao' }}</td>
            <td>
              <v-chip size="x-small" variant="tonal" color="primary">
                #{{ evt.alunoId ?? '-' }}
              </v-chip>
            </td>
            <td class="text-caption">{{ formatarData(evt.ocorridoEm) }}</td>
            <td class="text-caption">{{ formatarData(evt.recebidoEm) }}</td>
          </tr>
        </tbody>
      </v-table>

      <EstadoVazio
        v-else-if="!carregando && !erro"
        icone="mdi-chip"
        mensagem="Nenhum evento registrado para este laboratorio ainda."
      />
    </v-card>
  </section>
</template>

<style scoped>
.ge-stat-card {
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 0.5) 100%);
}

.ge-tabela :deep(thead th) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.ge-tabela :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
