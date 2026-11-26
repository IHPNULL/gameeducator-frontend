import { computed, ref } from 'vue'
import {
  aprovarAcaoDoAgente,
  conversarComAgente,
  listarAcoesDoAgente,
  listarMetasDeEstudo,
  rejeitarAcaoDoAgente,
} from '../api/client.js'

function agora() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * RF04 - conversa com o agente de IA do papel do usuario e decisao das acoes que ele propoe.
 * O agente nunca executa nada: as propostas chegam PENDENTES e so rodam quando o usuario aprova.
 */
export function useAgente(cursoId) {
  const mensagens = ref([])
  const agente = ref('')
  const acoes = ref([])
  const metas = ref([])
  const pensando = ref(false)
  const decidindo = ref(null)
  const erro = ref('')

  const pendentes = computed(() => acoes.value.filter((a) => a.status === 'PENDENTE'))
  const decididas = computed(() => acoes.value.filter((a) => a.status !== 'PENDENTE'))

  async function carregar() {
    erro.value = ''
    try {
      const [listaAcoes, listaMetas] = await Promise.all([listarAcoesDoAgente(cursoId), listarMetasDeEstudo(cursoId)])
      acoes.value = listaAcoes
      metas.value = listaMetas
    } catch (e) {
      erro.value = e.message
    }
  }

  async function enviar(texto) {
    const mensagem = texto?.trim()
    if (!mensagem || pensando.value) return
    mensagens.value.push({ tipo: 'usuario', conteudo: mensagem, dataHora: agora() })
    pensando.value = true
    erro.value = ''
    try {
      const resposta = await conversarComAgente(cursoId, mensagem)
      agente.value = resposta.agente
      mensagens.value.push({ tipo: 'agente', conteudo: resposta.resposta, dataHora: agora() })
      await carregar()
    } catch (e) {
      mensagens.value.push({ tipo: 'erro', conteudo: e.message, dataHora: agora() })
    } finally {
      pensando.value = false
    }
  }

  async function decidir(acao, aprovar) {
    decidindo.value = acao.id
    erro.value = ''
    try {
      await (aprovar ? aprovarAcaoDoAgente(cursoId, acao.id) : rejeitarAcaoDoAgente(cursoId, acao.id))
      await carregar()
    } catch (e) {
      erro.value = e.message
    } finally {
      decidindo.value = null
    }
  }

  function reiniciar() {
    mensagens.value = []
    agente.value = ''
    acoes.value = []
    metas.value = []
  }

  return {
    mensagens,
    agente,
    acoes,
    metas,
    pendentes,
    decididas,
    pensando,
    decidindo,
    erro,
    carregar,
    enviar,
    aprovar: (acao) => decidir(acao, true),
    rejeitar: (acao) => decidir(acao, false),
    reiniciar,
  }
}
