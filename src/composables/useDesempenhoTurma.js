import { ref } from 'vue'
import { buscarDesempenhoTurma, lancarNota } from '../api/client.js'

export function useDesempenhoTurma(cursoId) {
  const desempenho = ref([])
  const carregando = ref(false)
  const salvandoNota = ref(false)
  const erro = ref('')
  const sucessoNota = ref('')

  async function carregar() {
    carregando.value = true
    erro.value = ''
    try {
      desempenho.value = await buscarDesempenhoTurma(cursoId)
    } catch (e) {
      erro.value = e.message
    } finally {
      carregando.value = false
    }
  }

  async function registrarNota(alunoId, avaliacao, valor) {
    salvandoNota.value = true
    erro.value = ''
    sucessoNota.value = ''
    try {
      await lancarNota(cursoId, alunoId, avaliacao, valor)
      sucessoNota.value = `Nota lancada com sucesso para o aluno!`
      return true
    } catch (e) {
      erro.value = e.message
      return false
    } finally {
      salvandoNota.value = false
    }
  }

  return {
    desempenho,
    carregando,
    salvandoNota,
    erro,
    sucessoNota,
    carregar,
    registrarNota,
  }
}

