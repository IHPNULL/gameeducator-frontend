import { ref } from 'vue'
import { listarMissoes, buscarProgresso, enviarResposta, buscarTentativas } from '../api/client.js'

export function useMissoes(cursoId) {
  const missoes = ref([])
  const xpTotal = ref(0)
  const resultados = ref({})
  const medalhasRecemConquistadas = ref([])
  const tentativasPorDesafio = ref({})
  const carregandoTentativas = ref({})
  const carregando = ref(false)
  const erro = ref('')

  async function carregar() {
    carregando.value = true
    erro.value = ''
    try {
      missoes.value = await listarMissoes(cursoId)
      const progresso = await buscarProgresso(cursoId)
      xpTotal.value = progresso.xpTotal
    } catch (e) {
      erro.value = e.message
    } finally {
      carregando.value = false
    }
  }

  async function carregarTentativas(desafioId) {
    carregandoTentativas.value[desafioId] = true
    try {
      tentativasPorDesafio.value[desafioId] = await buscarTentativas(desafioId)
    } catch {
      tentativasPorDesafio.value[desafioId] = []
    } finally {
      carregandoTentativas.value[desafioId] = false
    }
  }

  async function responder(desafioId, indiceResposta) {
    erro.value = ''
    try {
      const resultado = await enviarResposta(desafioId, indiceResposta)
      resultados.value = { ...resultados.value, [desafioId]: resultado }
      xpTotal.value = resultado.xpTotalNoCurso
      medalhasRecemConquistadas.value = resultado.medalhasConquistadas ?? []
      if (tentativasPorDesafio.value[desafioId]) {
        await carregarTentativas(desafioId)
      }
    } catch (e) {
      erro.value = e.message
    }
  }

  return {
    missoes,
    xpTotal,
    resultados,
    medalhasRecemConquistadas,
    tentativasPorDesafio,
    carregandoTentativas,
    carregando,
    erro,
    carregar,
    carregarTentativas,
    responder,
  }
}
