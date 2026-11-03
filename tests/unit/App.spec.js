import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../../src/App.vue'
import router from '../../src/router/index.js'
import * as api from '../../src/api/client.js'

describe('App.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(api, 'listarMissoes').mockResolvedValue([])
    vi.spyOn(api, 'buscarProgresso').mockResolvedValue({ xpTotal: 0 })
    vi.spyOn(api, 'buscarRecomendacoes').mockResolvedValue({ itens: [] })
  })

  it('monta o app e renderiza a barra superior e o menu', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('GameEducator')
    expect(wrapper.text()).toContain('Missoes do aluno')
    expect(wrapper.text()).toContain('Assistente IA')
  })

  it('identifica corretamente o papel do usuario de acordo com o ID', async () => {
    api.definirUsuarioAtual(1)
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Professora Ana')

    const input = wrapper.find('input[type="number"]')
    await input.setValue(2)
    await input.trigger('change')
    await flushPromises()

    expect(wrapper.text()).toContain('Aluno Bruno')
  })

  it('permite alternar o tema entre claro e escuro', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })
    await flushPromises()

    const botaoTema = wrapper.find('button[aria-label="Alternar tema"]')
    expect(botaoTema.exists()).toBe(true)
    await botaoTema.trigger('click')
    await flushPromises()
  })

  it('permite clicar nos botoes rapidos de persona', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })
    await flushPromises()

    const botoesPersona = wrapper.findAll('.v-navigation-drawer button')
    const botaoCarlos = botoesPersona.find((b) => b.text().includes('Carlos'))
    if (botaoCarlos) {
      await botaoCarlos.trigger('click')
      await flushPromises()
      expect(api.usuarioAtual()).toBe(3)
    }
  })
})
