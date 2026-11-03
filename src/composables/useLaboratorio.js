import { ref } from 'vue'
import { buscarEventosLaboratorio } from '../api/client.js'

export function useLaboratorio(labInicial = 'lab-1') {
  const laboratorio = ref(labInicial)
  const eventos = ref({ laboratorio: labInicial, total: 0, recentes: [] })
  const carregando = ref(false)
  const erro = ref('')

  async function carregar(nomeLab = laboratorio.value) {
    laboratorio.value = nomeLab
    carregando.value = true
    erro.value = ''
    try {
      eventos.value = await buscarEventosLaboratorio(nomeLab)
    } catch (e) {
      erro.value = e.message
    } finally {
      carregando.value = false
    }
  }

  return {
    laboratorio,
    eventos,
    carregando,
    erro,
    carregar,
  }
}
