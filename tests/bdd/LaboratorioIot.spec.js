import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LaboratorioView from '../../src/views/LaboratorioView.vue'
import * as api from '../../src/api/client.js'

/**
 * RF06 - Monitoramento de eventos do Laboratorio IoT.
 */
describe('RF06: Laboratorio IoT e telemetria', () => {
  const eventosLab = {
    laboratorio: 'lab-1',
    total: 3,
    recentes: [
      {
        eventoId: 'evt-100',
        dispositivo: 'bancada-fisica-01',
        tipo: 'PRESENCA',
        alunoId: 2,
        atividade: 'Experimento de Optica',
        ocorridoEm: '2026-10-20T10:00:00Z',
        recebidoEm: '2026-10-20T10:00:01Z',
      },
    ],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'buscarEventosLaboratorio').mockResolvedValue(eventosLab)
  })

  it('Quando abre a tela, Entao lista os eventos de telemetria recebidos', async () => {
    const wrapper = mount(LaboratorioView)
    await flushPromises()

    expect(wrapper.text()).toContain('bancada-fisica-01')
    expect(wrapper.text()).toContain('PRESENCA')
    expect(wrapper.text()).toContain('Experimento de Optica')
    expect(wrapper.text()).toContain('3')
  })
})
