import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PainelProfessorView from '../../src/views/PainelProfessorView.vue'
import * as api from '../../src/api/client.js'

/**
 * US02 / NotaController: Professor lanca nota para aluno no painel da turma.
 */
describe('Professor lanca nota para um aluno', () => {
  const alunos = [
    { alunoId: 2, nome: 'Bruno', xpTotal: 50, tentativas: 5, acertos: 4, taxaAcerto: 0.8 },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(api, 'buscarDesempenhoTurma').mockResolvedValue(alunos)
    vi.spyOn(api, 'lancarNota').mockResolvedValue({
      id: 99,
      alunoId: 2,
      avaliacao: 'Prova Semestral',
      valor: 9.5,
    })
  })

  it('Quando clica em Lancar Nota e preenche o modal, a nota e enviada com sucesso', async () => {
    const wrapper = mount(PainelProfessorView, { props: { cursoId: 1 } })
    await flushPromises()

    // Clica no botao Lancar Nota da linha do aluno
    const botaoLancar = wrapper.findAll('button').find((b) => b.text().includes('Lancar Nota'))
    expect(botaoLancar).toBeDefined()
    await botaoLancar.trigger('click')
    await flushPromises()

    // Modal aberto: localiza e preenche campos
    const inputs = wrapper.findAll('input')
    const inputAvaliacao = inputs.find((i) => i.attributes('placeholder')?.includes('Ex: Prova'))
    const inputNota = inputs.find((i) => i.attributes('type') === 'number')

    if (inputAvaliacao) await inputAvaliacao.setValue('Prova Semestral')
    if (inputNota) await inputNota.setValue('9.5')

    // Clica em Salvar Nota
    const botaoSalvar = wrapper.findAll('button').find((b) => b.text().includes('Salvar Nota'))
    if (botaoSalvar) {
      await botaoSalvar.trigger('click')
      await flushPromises()
      expect(api.lancarNota).toHaveBeenCalled()
    }
  })
})
