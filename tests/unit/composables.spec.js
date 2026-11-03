import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useCriarMissao } from '../../src/composables/useCriarMissao.js'
import { useDesempenhoTurma } from '../../src/composables/useDesempenhoTurma.js'
import { useForum } from '../../src/composables/useForum.js'
import { useIa } from '../../src/composables/useIa.js'
import { useLaboratorio } from '../../src/composables/useLaboratorio.js'
import { useMedalhas } from '../../src/composables/useMedalhas.js'
import { useMissoes } from '../../src/composables/useMissoes.js'
import { useNotas } from '../../src/composables/useNotas.js'
import { useRanking } from '../../src/composables/useRanking.js'
import * as api from '../../src/api/client.js'

describe('Composables Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('useCriarMissao', () => {
    it('carrega missoes e valida formulario com sucesso ou erro', async () => {
      vi.spyOn(api, 'listarMissoes').mockResolvedValue([{ id: 1, titulo: 'Existente' }])

      let composable
      const TestComponent = defineComponent({
        setup() {
          composable = useCriarMissao(1)
          return () => null
        },
      })

      mount(TestComponent)
      await flushPromises()

      expect(composable.missoes.value).toHaveLength(1)

      // Salvar com erro
      vi.spyOn(api, 'criarMissao').mockRejectedValue(new Error('Erro ao salvar'))
      composable.form.titulo = 'Nova'
      composable.form.descricao = 'Desc'
      composable.form.desafios[0].enunciado = 'Enunciado'
      await composable.salvar()
      expect(composable.erro.value).toBe('Erro ao salvar')

      // Salvar com sucesso
      vi.spyOn(api, 'criarMissao').mockResolvedValue({ id: 2, titulo: 'Criada' })
      await composable.salvar()
      expect(composable.erro.value).toBe('')
      expect(composable.missoes.value).toHaveLength(2)
    })
  })

  describe('useDesempenhoTurma', () => {
    it('trata erro no carregamento e permite registrar nota', async () => {
      vi.spyOn(api, 'buscarDesempenhoTurma').mockRejectedValue(new Error('Falha turma'))
      const { erro, carregar, registrarNota } = useDesempenhoTurma(1)
      await carregar()
      expect(erro.value).toBe('Falha turma')

      // Registrar nota com sucesso
      vi.spyOn(api, 'lancarNota').mockResolvedValue({ id: 1, valor: 9.5 })
      const ok = await registrarNota(2, 'Prova', 9.5)
      expect(ok).toBe(true)

      // Registrar nota com erro
      vi.spyOn(api, 'lancarNota').mockRejectedValue(new Error('Nota invalida'))
      const falha = await registrarNota(2, 'Prova', 15)
      expect(falha).toBe(false)
      expect(erro.value).toBe('Nota invalida')
    })
  })

  describe('useForum', () => {
    it('trata carregamento, erro de publicacao e resposta enviada', async () => {
      vi.spyOn(api, 'listarPosts').mockRejectedValue(new Error('Erro forum'))
      const { novoPost, rascunhoResposta, erro, carregar, publicar, responder } = useForum(1)
      await carregar()
      expect(erro.value).toBe('Erro forum')

      // Publicar com erro
      vi.spyOn(api, 'publicarPost').mockRejectedValue(new Error('Erro ao postar'))
      novoPost.titulo = 'T'
      novoPost.conteudo = 'C'
      await publicar()
      expect(erro.value).toBe('Erro ao postar')

      // Responder com resposta preenchida
      rascunhoResposta[100] = 'Minha resposta'
      vi.spyOn(api, 'responderPost').mockResolvedValue({ id: 1, conteudo: 'Minha resposta' })
      await responder(100)
      expect(api.responderPost).toHaveBeenCalledWith(100, 'Minha resposta')

      // Responder com erro
      rascunhoResposta[200] = 'Erro'
      vi.spyOn(api, 'responderPost').mockRejectedValue(new Error('Falha resposta'))
      await responder(200)
      expect(erro.value).toBe('Falha resposta')
    })
  })

  describe('useIa', () => {
    it('trata falha nas recomendacoes e respostas do assistente', async () => {
      vi.spyOn(api, 'buscarRecomendacoes').mockRejectedValue(new Error('IA offline'))
      const { erroRecomendacoes, carregarRecomendacoes, enviarPergunta, mensagens } = useIa(1)
      await carregarRecomendacoes()
      expect(erroRecomendacoes.value).toBe('IA offline')

      // Enviar pergunta vazia
      await enviarPergunta('')
      expect(mensagens.value).toHaveLength(1)

      // Enviar pergunta com erro da IA (503)
      vi.spyOn(api, 'perguntarAssistente').mockRejectedValue(new Error('Servico indisponivel: 503'))
      await enviarPergunta('Duvida teste')
      expect(mensagens.value.some((m) => m.tipo === 'erro')).toBe(true)
    })
  })

  describe('useLaboratorio', () => {
    it('trata erro no carregamento e troca de laboratorio', async () => {
      vi.spyOn(api, 'buscarEventosLaboratorio').mockRejectedValue(new Error('Lab nao encontrado'))
      const { laboratorio, erro, carregar } = useLaboratorio('quimica')
      await carregar('quimica')
      expect(laboratorio.value).toBe('quimica')
      expect(erro.value).toBe('Lab nao encontrado')
    })
  })

  describe('useMedalhas', () => {
    it('carrega medalhas com sucesso e trata erros', async () => {
      vi.spyOn(api, 'buscarMedalhas').mockRejectedValue(new Error('Falha medalhas'))
      const { medalhas, erroMedalhas, carregarMedalhas } = useMedalhas(1)
      await carregarMedalhas()
      expect(erroMedalhas.value).toBe('Falha medalhas')
      expect(medalhas.value).toEqual([])
    })
  })

  describe('useMissoes', () => {
    it('trata erro no envio de resposta e busca tentativas', async () => {
      vi.spyOn(api, 'listarMissoes').mockResolvedValue([])
      vi.spyOn(api, 'buscarProgresso').mockResolvedValue({ xpTotal: 0 })
      const { responder, carregarTentativas, tentativasPorDesafio, erro } = useMissoes(1)

      // Responder com erro
      vi.spyOn(api, 'enviarResposta').mockRejectedValue(new Error('Erro desafio'))
      await responder(10, 0)
      expect(erro.value).toBe('Erro desafio')

      // Carregar tentativas com sucesso
      vi.spyOn(api, 'buscarTentativas').mockResolvedValue([{ id: 1, correta: true }])
      await carregarTentativas(10)
      expect(tentativasPorDesafio.value[10]).toHaveLength(1)

      // Carregar tentativas com erro (fallback para array vazio)
      vi.spyOn(api, 'buscarTentativas').mockRejectedValue(new Error('Falha'))
      await carregarTentativas(20)
      expect(tentativasPorDesafio.value[20]).toEqual([])
    })
  })

  describe('useNotas', () => {
    it('trata erro no carregamento de notas', async () => {
      vi.spyOn(api, 'listarNotas').mockRejectedValue(new Error('Falha notas'))
      const { notas, erro, carregar } = useNotas(1)
      await carregar()
      expect(erro.value).toBe('Falha notas')
      expect(notas.value).toEqual([])
    })
  })

  describe('useRanking', () => {
    it('identifica corretamente souEu', () => {
      api.definirUsuarioAtual(5)
      const { souEu } = useRanking(1)
      expect(souEu(5)).toBe(true)
      expect(souEu(10)).toBe(false)
    })
  })
})
