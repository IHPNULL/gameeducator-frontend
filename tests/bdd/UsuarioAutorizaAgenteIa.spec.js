import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AgenteView from '../../src/views/AgenteView.vue'
import * as api from '../../src/api/client.js'

/**
 * RF04 (AF) - Agentes de IA coordenam orientacao e acompanhamento, com autorizacao do usuario.
 */
describe('RF04: Usuario conversa com o agente de IA e autoriza as acoes propostas', () => {
  const proposta = {
    id: 7,
    tipo: 'META_DE_ESTUDO',
    status: 'PENDENTE',
    descricao: 'Meta: concluir "Fracoes" ate 2026-12-01.',
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'listarAcoesDoAgente').mockResolvedValue([])
    vi.spyOn(api, 'listarMetasDeEstudo').mockResolvedValue([])
  })

  async function enviar(wrapper, texto) {
    await wrapper.find('input[type="text"]').setValue(texto)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
  }

  it('Dado um aluno, Quando pede uma meta, Entao ve a resposta do agente de orientacao e a acao PENDENTE', async () => {
    vi.spyOn(api, 'conversarComAgente').mockResolvedValue({
      agente: 'orientacao',
      resposta: 'Proposta #7 aguardando aprovacao',
      acoesPendentes: [proposta],
    })
    api.listarAcoesDoAgente.mockResolvedValueOnce([]).mockResolvedValueOnce([proposta])

    const wrapper = mount(AgenteView, { props: { cursoId: 1 } })
    await flushPromises()
    await enviar(wrapper, 'Crie uma meta')

    expect(api.conversarComAgente).toHaveBeenCalledWith(1, 'Crie uma meta')
    expect(wrapper.find('[data-test="agente-ativo"]').text()).toContain('Orientacao')
    expect(wrapper.find('[data-test="chat"]').text()).toContain('Proposta #7 aguardando aprovacao')
    expect(wrapper.find('[data-test="pendentes"]').text()).toContain('concluir "Fracoes"')
    expect(wrapper.find('[data-test="metas"]').exists()).toBe(false)
  })

  it('Quando o usuario aprova, Entao o Core executa a acao e a meta aparece', async () => {
    api.listarAcoesDoAgente.mockResolvedValueOnce([proposta]).mockResolvedValueOnce([{ ...proposta, status: 'EXECUTADA' }])
    api.listarMetasDeEstudo.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 1, descricao: 'Meta: concluir "Fracoes"' }])
    vi.spyOn(api, 'aprovarAcaoDoAgente').mockResolvedValue({ ...proposta, status: 'EXECUTADA' })

    const wrapper = mount(AgenteView, { props: { cursoId: 1 } })
    await flushPromises()
    await wrapper.find('[data-test="acao-7"] .win-btn-default').trigger('click')
    await flushPromises()

    expect(api.aprovarAcaoDoAgente).toHaveBeenCalledWith(1, 7)
    expect(wrapper.find('[data-test="pendentes"]').text()).toContain('Nenhuma acao proposta')
    expect(wrapper.find('[data-test="metas"]').text()).toContain('concluir "Fracoes"')
    expect(wrapper.find('[data-test="historico"]').text()).toContain('EXECUTADA')
  })

  it('Quando o professor rejeita um lembrete, Entao nada e enviado e fica no historico como REJEITADA', async () => {
    const lembrete = { id: 9, tipo: 'LEMBRETE_AO_ALUNO', status: 'PENDENTE', descricao: 'Enviar lembrete para Carla' }
    api.listarAcoesDoAgente.mockResolvedValueOnce([lembrete]).mockResolvedValueOnce([{ ...lembrete, status: 'REJEITADA' }])
    vi.spyOn(api, 'rejeitarAcaoDoAgente').mockResolvedValue({ ...lembrete, status: 'REJEITADA' })

    const wrapper = mount(AgenteView, { props: { cursoId: 1 } })
    await flushPromises()
    expect(wrapper.find('[data-test="acao-9"]').text()).toContain('LEMBRETE AO ALUNO')
    const [, rejeitar] = wrapper.findAll('[data-test="acao-9"] button')
    await rejeitar.trigger('click')
    await flushPromises()

    expect(api.rejeitarAcaoDoAgente).toHaveBeenCalledWith(1, 9)
    expect(wrapper.find('[data-test="historico"]').text()).toContain('REJEITADA')
  })

  it('Dado o professor, Entao as macros passam a ser de acompanhamento da turma', async () => {
    vi.spyOn(api, 'conversarComAgente').mockResolvedValue({ agente: 'acompanhamento', resposta: 'Turma ok', acoesPendentes: [] })

    const wrapper = mount(AgenteView, { props: { cursoId: 1 } })
    await flushPromises()
    await wrapper.findAll('.ge-macro-btn')[2].trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="agente-ativo"]').text()).toContain('Acompanhamento')
    expect(wrapper.text()).toContain('Quem esta com mais dificuldade?')
  })

  it('Quando o LLM esta fora do ar, Entao a conversa mostra o erro e a tela continua usavel', async () => {
    vi.spyOn(api, 'conversarComAgente').mockRejectedValue(new Error('O agente de IA esta indisponivel no momento'))

    const wrapper = mount(AgenteView, { props: { cursoId: 1 } })
    await flushPromises()
    await enviar(wrapper, 'oi')

    expect(wrapper.find('[data-test="chat"]').text()).toContain('indisponivel')
    expect(wrapper.find('input[type="text"]').element.disabled).toBe(false)
  })

  it('Quando aprovar falha (ex.: ja decidida), Entao mostra a mensagem do Core', async () => {
    api.listarAcoesDoAgente.mockResolvedValue([proposta])
    vi.spyOn(api, 'aprovarAcaoDoAgente').mockRejectedValue(new Error('A acao 7 ja foi decidida'))

    const wrapper = mount(AgenteView, { props: { cursoId: 1 } })
    await flushPromises()
    await wrapper.find('[data-test="acao-7"] .win-btn-default').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="pendentes"]').text()).toContain('ja foi decidida')
  })
})
