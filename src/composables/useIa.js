import { ref } from 'vue'
import { buscarRecomendacoes, perguntarAssistente } from '../api/client.js'

export function useIa(cursoId) {
  const recomendacoes = ref({ origem: '', modeloVersao: '', itens: [] })
  const carregandoRecomendacoes = ref(false)
  const erroRecomendacoes = ref('')

  const mensagens = ref([
    {
      tipo: 'assistente',
      conteudo: 'Ola! Eu sou o assistente inteligente do GameEducator. Posso tirar duvidas sobre o conteudo das aulas e te ajudar nas missoes. Como posso ajudar hoje?',
      fontes: [],
      dataHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const carregandoResposta = ref(false)
  const erroAssistente = ref('')

  async function carregarRecomendacoes() {
    carregandoRecomendacoes.value = true
    erroRecomendacoes.value = ''
    try {
      recomendacoes.value = await buscarRecomendacoes(cursoId)
    } catch (e) {
      erroRecomendacoes.value = e.message
    } finally {
      carregandoRecomendacoes.value = false
    }
  }

  async function enviarPergunta(perguntaTexto) {
    if (!perguntaTexto || !perguntaTexto.trim()) return

    const pergunta = perguntaTexto.trim()
    mensagens.value.push({
      tipo: 'usuario',
      conteudo: pergunta,
      dataHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    carregandoResposta.value = true
    erroAssistente.value = ''

    try {
      const resposta = await perguntarAssistente(cursoId, pergunta)
      mensagens.value.push({
        tipo: 'assistente',
        conteudo: resposta.resposta,
        fontes: resposta.fontes ?? [],
        provedor: resposta.provedor,
        dataHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    } catch (e) {
      erroAssistente.value = e.message
      mensagens.value.push({
        tipo: 'erro',
        conteudo: `Nao foi possivel obter a resposta da IA (${e.message}). O servico de IA pode estar temporariamente fora do ar.`,
        dataHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    } finally {
      carregandoResposta.value = false
    }
  }

  return {
    recomendacoes,
    carregandoRecomendacoes,
    erroRecomendacoes,
    carregarRecomendacoes,
    mensagens,
    carregandoResposta,
    erroAssistente,
    enviarPergunta,
  }
}
