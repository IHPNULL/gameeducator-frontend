import { ref } from 'vue'
import { buscarMedalhas } from '../api/client.js'

export function useMedalhas(cursoId) {
  const medalhas = ref([])
  const carregandoMedalhas = ref(false)
  const erroMedalhas = ref('')

  async function carregarMedalhas() {
    carregandoMedalhas.value = true
    erroMedalhas.value = ''
    try {
      medalhas.value = await buscarMedalhas(cursoId)
    } catch (e) {
      erroMedalhas.value = e.message
    } finally {
      carregandoMedalhas.value = false
    }
  }

  return {
    medalhas,
    carregandoMedalhas,
    erroMedalhas,
    carregarMedalhas,
  }
}
