import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  usuarioAtual,
  definirUsuarioAtual,
  listarMissoes,
  criarMissao,
  enviarResposta,
  buscarProgresso,
  buscarRanking,
  listarNotas,
  lancarNota,
  listarPosts,
  publicarPost,
  responderPost,
  buscarMedalhas,
  buscarTentativas,
  buscarRecomendacoes,
  perguntarAssistente,
  buscarEventosLaboratorio,
  buscarDesempenhoTurma,
} from '../../src/api/client.js'

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('usuarioAtual retorna null quando nao ha valor no localStorage', () => {
    expect(usuarioAtual()).toBeNull()
  })

  it('definirUsuarioAtual e usuarioAtual gravam e leem o ID do usuario', () => {
    definirUsuarioAtual(10)
    expect(usuarioAtual()).toBe(10)
  })

  it('envia o header X-Usuario-Id quando ha um usuario definido', async () => {
    definirUsuarioAtual(42)
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))

    await listarMissoes(1)

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['X-Usuario-Id']).toBe('42')
  })

  it('lanca erro com a mensagem do backend quando a resposta nao e ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ mensagem: 'nao autorizado' }), { status: 403 }),
    )

    await expect(listarMissoes(1)).rejects.toThrow('nao autorizado')
  })

  it('lanca erro generico quando o corpo do erro nao e json valido', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Error', { status: 500, statusText: 'Server Error' }),
    )

    await expect(listarMissoes(1)).rejects.toThrow('Server Error')
  })

  it('retorna null em resposta 204 No Content', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    )

    const res = await buscarProgresso(1)
    expect(res).toBeNull()
  })

  it('criarMissao envia POST com o corpo da nova missao', async () => {
    const nova = { titulo: 'M1', descricao: 'Desc', desafios: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1, ...nova }), { status: 201 }),
    )

    const res = await criarMissao(1, nova)
    expect(res.id).toBe(1)
    const [url, opt] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/cursos/1/missoes')
    expect(opt.method).toBe('POST')
    expect(JSON.parse(opt.body)).toEqual(nova)
  })

  it('enviarResposta envia POST com indice da resposta', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ correta: true, xpGanho: 10 }), { status: 200 }),
    )

    const res = await enviarResposta(50, 2)
    expect(res.correta).toBe(true)
    const [url, opt] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/desafios/50/respostas')
    expect(opt.method).toBe('POST')
    expect(JSON.parse(opt.body)).toEqual({ indiceResposta: 2 })
  })

  it('buscarProgresso faz GET para o progresso do curso', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ xpTotal: 100 }), { status: 200 }),
    )

    const res = await buscarProgresso(1)
    expect(res.xpTotal).toBe(100)
  })

  it('buscarRanking faz GET para o ranking do curso', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ alunoId: 2, xpTotal: 50 }]), { status: 200 }),
    )

    const res = await buscarRanking(1)
    expect(res).toHaveLength(1)
  })

  it('listarNotas faz GET para notas do curso', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, valor: 8.5 }]), { status: 200 }),
    )

    const notas = await listarNotas(1)
    expect(notas).toHaveLength(1)
  })

  it('lancarNota envia POST para a rota de nota do aluno', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 2, valor: 9.0 }), { status: 200 }),
    )

    const nota = await lancarNota(1, 2, 'P1', 9.0)
    expect(nota.valor).toBe(9.0)
    const [url, opt] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/cursos/1/notas/2')
    expect(opt.method).toBe('POST')
  })

  it('listarPosts faz GET no forum', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, titulo: 'Duvida' }]), { status: 200 }),
    )

    const posts = await listarPosts(1)
    expect(posts).toHaveLength(1)
  })

  it('publicarPost envia POST no forum', async () => {
    const fetchPub = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 2, titulo: 'Novo' }), { status: 200 }),
    )
    await publicarPost(1, 'Novo', 'Conteudo')
    expect(fetchPub.mock.calls[0][1].method).toBe('POST')
  })

  it('responderPost envia POST para resposta de post', async () => {
    const fetchResp = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 3, conteudo: 'Resposta' }), { status: 200 }),
    )
    await responderPost(2, 'Resposta')
    expect(fetchResp.mock.calls[0][1].method).toBe('POST')
  })

  it('buscarMedalhas faz GET para as medalhas', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ marcoXp: 50 }]), { status: 200 }),
    )
    const medalhas = await buscarMedalhas(1)
    expect(medalhas).toHaveLength(1)
  })

  it('buscarDesempenhoTurma faz GET para o desempenho da turma', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ alunoId: 2, taxaAcerto: 0.8 }]), { status: 200 }),
    )
    const desempenho = await buscarDesempenhoTurma(1)
    expect(desempenho).toHaveLength(1)
  })

  it('busca tentativas de um desafio', async () => {
    const mockData = [{ id: 1, correta: true, xpGanho: 10 }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 }),
    )

    const res = await buscarTentativas(100)
    expect(res).toEqual(mockData)
  })

  it('busca recomendacoes de missoes do curso', async () => {
    const mockRecs = { origem: 'ia', itens: [{ missaoId: 1, titulo: 'Intro' }] }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockRecs), { status: 200 }),
    )

    const res = await buscarRecomendacoes(1)
    expect(res).toEqual(mockRecs)
  })

  it('pergunta ao assistente de IA com payload JSON', async () => {
    const mockResp = { resposta: 'Explicacao', fontes: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockResp), { status: 200 }),
    )

    const res = await perguntarAssistente(1, 'Como somar fracoes?')
    expect(res).toEqual(mockResp)
    const [, options] = fetchMock.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ pergunta: 'Como somar fracoes?' })
  })

  it('busca eventos de laboratorio IoT', async () => {
    const mockEvts = { laboratorio: 'lab-1', total: 5, recentes: [] }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockEvts), { status: 200 }),
    )

    const res = await buscarEventosLaboratorio('lab-1')
    expect(res).toEqual(mockEvts)
  })
})
