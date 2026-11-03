import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AssistenteView from '../../src/views/AssistenteView.vue'
import * as api from '../../src/api/client.js'

/**
 * RF03 / RF04 - Aluno consulta recomendacoes e pergunta ao assistente de IA.
 */
describe('RF03/RF04: Aluno interage com assistente de IA', () => {
  const recomendacoes = {
    origem: 'ia',
    modeloVersao: '1.0',
    itens: [
      {
        missaoId: 10,
        titulo: 'Missao Recomendada de Geometria',
        pontuacao: 0.95,
        motivo: 'Ideal para o seu nivel de XP atual',
      },
    ],
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'buscarRecomendacoes').mockResolvedValue(recomendacoes)
  })

  it('Quando abre a tela, Entao visualiza a missao recomendada pela IA', async () => {
    const wrapper = mount(AssistenteView, { props: { cursoId: 1 } })
    await flushPromises()

    expect(wrapper.text()).toContain('Missao Recomendada de Geometria')
    expect(wrapper.text()).toContain('Ideal para o seu nivel de XP atual')
  })

  it('Quando envia uma pergunta, Entao recebe a resposta com as fontes citadas', async () => {
    vi.spyOn(api, 'perguntarAssistente').mockResolvedValue({
      resposta: 'Fracoes sao partes de um todo.',
      fontes: [{ id: 'f1', titulo: 'Apostila de Matematica', relevancia: 0.88 }],
      provedor: 'gemini',
    })

    const wrapper = mount(AssistenteView, { props: { cursoId: 1 } })
    await flushPromises()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('O que e fracao?')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(api.perguntarAssistente).toHaveBeenCalledWith(1, 'O que e fracao?')
    expect(wrapper.text()).toContain('Fracoes sao partes de um todo.')
    expect(wrapper.text()).toContain('Apostila de Matematica')
  })
})
