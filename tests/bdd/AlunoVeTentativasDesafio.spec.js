import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MissoesView from '../../src/views/MissoesView.vue'
import * as api from '../../src/api/client.js'

/**
 * US01 / Desejavel: Aluno acompanha o historico de tentativas em um desafio.
 */
describe('Aluno consulta o historico de tentativas em um desafio', () => {
  const missoes = [
    {
      id: 1,
      titulo: 'Missao 1',
      descricao: 'Introducao',
      xpTotal: 20,
      desafios: [
        { id: 10, enunciado: 'Quanto e 10 + 10?', alternativas: ['20', '30'], xp: 20 },
      ],
    },
  ]

  const tentativas = [
    { id: 1, indiceResposta: 0, correta: true, xpGanho: 20, dataHora: '2026-10-20T10:00:00Z' },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'listarMissoes').mockResolvedValue(missoes)
    vi.spyOn(api, 'buscarProgresso').mockResolvedValue({ xpTotal: 20 })
    vi.spyOn(api, 'buscarTentativas').mockResolvedValue(tentativas)
    vi.spyOn(api, 'buscarRecomendacoes').mockResolvedValue({ itens: [] })
  })

  it('Quando clica em Ver tentativas, Entao a lista de tentativas anteriores e exibida', async () => {
    const wrapper = mount(MissoesView, { props: { cursoId: 1 } })
    await flushPromises()

    const botaoVer = wrapper.findAll('button').find((b) => b.text().includes('Ver tentativas'))
    expect(botaoVer).toBeDefined()
    await botaoVer.trigger('click')
    await flushPromises()

    expect(api.buscarTentativas).toHaveBeenCalledWith(10)
    expect(wrapper.text()).toContain('Suas Tentativas Anteriores')
    expect(wrapper.text()).toContain('Opcao escolhida: A')
    expect(wrapper.text()).toContain('+20 XP')
  })
})
